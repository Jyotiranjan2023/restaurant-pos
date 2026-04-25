package com.restaurantpos.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurantpos.backend.dto.request.AddItemsRequest;
import com.restaurantpos.backend.dto.request.CreateOrderRequest;
import com.restaurantpos.backend.dto.request.OrderItemRequest;
import com.restaurantpos.backend.dto.response.AddonSnapshot;
import com.restaurantpos.backend.dto.response.OrderItemResponse;
import com.restaurantpos.backend.dto.response.OrderResponse;
import com.restaurantpos.backend.entity.Customer;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.ProductAddon;
import com.restaurantpos.backend.entity.ProductVariant;
import com.restaurantpos.backend.entity.RestaurantTable;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.enums.OrderStatus;
import com.restaurantpos.backend.enums.OrderType;
import com.restaurantpos.backend.enums.TableStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.ProductAddonRepository;
import com.restaurantpos.backend.repository.ProductRepository;
import com.restaurantpos.backend.repository.ProductVariantRepository;
import com.restaurantpos.backend.repository.RestaurantTableRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.repository.UserRepository;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final KitchenService kitchenService;
    private final ProductRepository productRepo;
    private final RestaurantTableRepository tableRepo;
    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final InventoryService inventoryService;
    private final CustomerService customerService;
    private final ProductVariantRepository variantRepo;
    private final ProductAddonRepository addonRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepo,
            ProductRepository productRepo,
            RestaurantTableRepository tableRepo,
            UserRepository userRepo,
            TenantRepository tenantRepo,
            KitchenService kitchenService,
            InventoryService inventoryService,
            CustomerService customerService,
            ProductVariantRepository variantRepo,
            ProductAddonRepository addonRepo,
            NotificationService notificationService) {   // ← NEW
this.orderRepo = orderRepo;
this.productRepo = productRepo;
this.tableRepo = tableRepo;
this.userRepo = userRepo;
this.tenantRepo = tenantRepo;
this.kitchenService = kitchenService;
this.inventoryService = inventoryService;
this.customerService = customerService;
this.variantRepo = variantRepo;
this.addonRepo = addonRepo;
this.notificationService = notificationService;   // ← NEW
}
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        User currentUser = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate table for DINE_IN
        RestaurantTable table = null;
        if (req.getOrderType() == OrderType.DINE_IN) {
            if (req.getTableId() == null)
                throw new BadRequestException("Table ID is required for DINE_IN orders");

            table = tableRepo.findByIdAndTenantId(req.getTableId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

            if (table.getStatus() == TableStatus.RUNNING)
                throw new BadRequestException("Table already has a running order. Add items to existing order instead.");
        }

        // Build the Order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber(tenantId));
        order.setOrderType(req.getOrderType());
        order.setStatus(OrderStatus.RUNNING);
        order.setTable(table);
        order.setCustomerName(req.getCustomerName());
        order.setCustomerPhone(req.getCustomerPhone());
        order.setCustomerAddress(req.getCustomerAddress());
        order.setCreatedBy(currentUser);
        order.setTenant(tenant);

        // Auto-link to Customer entity if phone is provided
        if (req.getCustomerPhone() != null && !req.getCustomerPhone().isBlank()) {
            Customer customer = customerService.findOrCreateByPhone(
                    req.getCustomerPhone(),
                    req.getCustomerName(),
                    req.getCustomerAddress(),
                    tenantId);
            order.setCustomer(customer);
        }

        // Add items
        for (OrderItemRequest itemReq : req.getItems()) {
            OrderItem item = buildOrderItem(itemReq, order, tenantId);
            order.getItems().add(item);
        }

        recalculateTotals(order);

        order = orderRepo.save(order);

        // Update table status
        if (table != null) {
            table.setStatus(TableStatus.RUNNING);
            tableRepo.save(table);
        }

     // Broadcast each item to kitchen AND deduct inventory stock
        for (OrderItem item : order.getItems()) {
            kitchenService.broadcastNewItem(item);
            inventoryService.deductStockForOrderItem(item);
        }

        // ===== NEW: Notification — new order received =====
        notificationService.notifyForTenant(
                tenantId,
                com.restaurantpos.backend.enums.NotificationType.NEW_ORDER,
                com.restaurantpos.backend.enums.NotificationSeverity.INFO,
                "New Order #" + order.getOrderNumber(),
                "Type: " + order.getOrderType() + ", Total: ₹" + order.getTotalAmount(),
                "/orders/" + order.getId()
        );
        // ===== END NEW =====

        return toResponse(order);
    }

    public OrderResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Order order = orderRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order);
    }

    public List<OrderResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return orderRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse findRunningOrderByTable(Long tableId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Order order = orderRepo
                .findByTableIdAndStatusAndTenantId(tableId, OrderStatus.RUNNING, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("No running order for this table"));
        return toResponse(order);
    }

    // ========== Phase 4.4b: Additional Methods ==========

    /**
     * Add more items to an existing RUNNING order.
     * This is Petpooja's "KOT-17 Time 03:56" behavior — customer orders more.
     */
    @Transactional
    public OrderResponse addItems(Long orderId, AddItemsRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Order order = orderRepo.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.RUNNING)
            throw new BadRequestException("Can only add items to a RUNNING order");

        for (OrderItemRequest itemReq : req.getItems()) {
            OrderItem item = buildOrderItem(itemReq, order, tenantId);
            order.getItems().add(item);
        }

        recalculateTotals(order);
        order = orderRepo.save(order);

        // Broadcast newly-added items to kitchen AND deduct stock
        for (OrderItem item : order.getItems()) {
            if (item.getStatus() == OrderItemStatus.NEW) {
                kitchenService.broadcastNewItem(item);
                inventoryService.deductStockForOrderItem(item);
            }
        }

        return toResponse(order);
    }

    /**
     * Cancel a specific item in an order.
     */
    @Transactional
    public OrderResponse cancelItem(Long orderId, Long itemId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Order order = orderRepo.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.RUNNING)
            throw new BadRequestException("Can only cancel items in a RUNNING order");

        OrderItem item = order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in this order"));

        if (item.getStatus() == OrderItemStatus.CANCELLED)
            throw new BadRequestException("Item is already cancelled");

        if (item.getStatus() == OrderItemStatus.SERVED)
            throw new BadRequestException("Cannot cancel an item that has already been served");

        item.setStatus(OrderItemStatus.CANCELLED);

        recalculateTotals(order);
        order = orderRepo.save(order);

        return toResponse(order);
    }

    /**
     * Cancel an entire order (ADMIN-only via @PreAuthorize in controller).
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Order order = orderRepo.findByIdAndTenantId(orderId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.COMPLETED)
            throw new BadRequestException("Cannot cancel a completed order. Use refund flow instead.");

        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new BadRequestException("Order is already cancelled");

        order.setStatus(OrderStatus.CANCELLED);

        // Cancel all non-cancelled items
        for (OrderItem item : order.getItems()) {
            if (item.getStatus() != OrderItemStatus.CANCELLED &&
                item.getStatus() != OrderItemStatus.SERVED) {
                item.setStatus(OrderItemStatus.CANCELLED);
            }
        }

        // Free the table
        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus(TableStatus.AVAILABLE);
            tableRepo.save(table);
        }

        order = orderRepo.save(order);
        return toResponse(order);
    }

    /**
     * List all currently RUNNING orders for admin dashboard.
     */
    public List<OrderResponse> findRunningOrders() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return orderRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .filter(o -> o.getStatus() == OrderStatus.RUNNING)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ========== Helpers ==========

    private OrderItem buildOrderItem(OrderItemRequest itemReq, Order order, Long tenantId) {
        OrderItem item = new OrderItem();
        item.setQuantity(itemReq.getQuantity());
        item.setNotes(itemReq.getNotes());
        item.setStatus(OrderItemStatus.NEW);
        item.setIsCustom(Boolean.TRUE.equals(itemReq.getIsCustom()));
        item.setOrder(order);
        item.setTenant(order.getTenant());

        // ===== CUSTOM ITEM PATH =====
        if (Boolean.TRUE.equals(itemReq.getIsCustom())) {
            if (itemReq.getItemName() == null || itemReq.getItemPrice() == null)
                throw new BadRequestException("Custom items require itemName and itemPrice");

            item.setItemName(itemReq.getItemName());
            item.setItemPrice(itemReq.getItemPrice());
            item.setGstPercent(itemReq.getGstPercent() != null
                    ? itemReq.getGstPercent() : BigDecimal.ZERO);
            // Custom items can't have variants/addons — skip those fields
            recalculateItemSubtotal(item);
            return item;
        }

        // ===== REGULAR PRODUCT PATH =====
        if (itemReq.getProductId() == null)
            throw new BadRequestException("productId required for non-custom items");

        Product product = productRepo.findByIdAndTenantId(itemReq.getProductId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        item.setProduct(product);
        item.setItemName(product.getName());

        // Default to product's base price/GST
        BigDecimal basePrice = product.getPrice();
        BigDecimal gstPercent = product.getGstPercent() != null
                ? product.getGstPercent() : BigDecimal.ZERO;

        // ===== VARIANT HANDLING =====
        if (itemReq.getVariantId() != null) {
            ProductVariant variant = variantRepo.findByIdAndTenantId(itemReq.getVariantId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

            if (!variant.getProduct().getId().equals(product.getId()))
                throw new BadRequestException("Variant does not belong to this product");

            if (!Boolean.TRUE.equals(variant.getActive()))
                throw new BadRequestException("Variant is no longer available");

            // Override base price with variant price
            basePrice = variant.getPrice();
            if (variant.getGstPercent() != null) {
                gstPercent = variant.getGstPercent();
            }

            // Snapshot variant info on the order item
            item.setVariantId(variant.getId());
            item.setVariantName(variant.getName());
            item.setItemName(product.getName() + " (" + variant.getName() + ")");
        }

        // ===== ADDON HANDLING =====
        BigDecimal addonsTotal = BigDecimal.ZERO;
        if (itemReq.getAddonIds() != null && !itemReq.getAddonIds().isEmpty()) {
            List<AddonSnapshot> snapshots = new ArrayList<>();

            for (Long addonId : itemReq.getAddonIds()) {
                ProductAddon addon = addonRepo.findByIdAndTenantId(addonId, tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Addon not found: id=" + addonId));

                if (!addon.getProduct().getId().equals(product.getId()))
                    throw new BadRequestException(
                            "Addon '" + addon.getName() + "' does not belong to this product");

                if (!Boolean.TRUE.equals(addon.getActive()))
                    throw new BadRequestException(
                            "Addon '" + addon.getName() + "' is no longer available");

                snapshots.add(new AddonSnapshot(addon.getId(), addon.getName(), addon.getPrice()));
                addonsTotal = addonsTotal.add(addon.getPrice());
            }

            // Serialize to JSON
            try {
                item.setAddonsJson(objectMapper.writeValueAsString(snapshots));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize addons", e);
            }
        }

        // ===== FINAL PRICING =====
        BigDecimal finalUnitPrice = basePrice.add(addonsTotal);
        item.setItemPrice(finalUnitPrice);
        item.setGstPercent(gstPercent);

        recalculateItemSubtotal(item);
        return item;
    }

    private void recalculateItemSubtotal(OrderItem item) {
        BigDecimal subtotal = item.getItemPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);
        item.setSubtotal(subtotal);
    }

    private void recalculateTotals(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            // Skip cancelled items in total
            if (item.getStatus() == OrderItemStatus.CANCELLED) continue;

            subtotal = subtotal.add(item.getSubtotal());

            BigDecimal itemGst = item.getSubtotal()
                    .multiply(item.getGstPercent())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            gstAmount = gstAmount.add(itemGst);
        }

        order.setSubtotal(subtotal);
        order.setGstAmount(gstAmount);
        BigDecimal total = subtotal.add(gstAmount).subtract(order.getDiscount());
        order.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
    }

    private String generateOrderNumber(Long tenantId) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "ORD-" + tenantId + "-" + datePart + "-";
        long count = orderRepo.countByTenantIdAndOrderNumberStartingWith(tenantId, prefix);
        return prefix + String.format("%04d", count + 1);
    }

    private OrderResponse toResponse(Order o) {
        OrderResponse r = new OrderResponse();
        r.setId(o.getId());
        r.setOrderNumber(o.getOrderNumber());
        r.setOrderType(o.getOrderType());
        r.setStatus(o.getStatus());
        if (o.getTable() != null) {
            r.setTableId(o.getTable().getId());
            r.setTableNumber(o.getTable().getTableNumber());
        }
        r.setCustomerName(o.getCustomerName());
        r.setCustomerPhone(o.getCustomerPhone());
        r.setCustomerAddress(o.getCustomerAddress());
        r.setSubtotal(o.getSubtotal());
        r.setGstAmount(o.getGstAmount());
        r.setDiscount(o.getDiscount());
        r.setTotalAmount(o.getTotalAmount());
        r.setCreatedByUsername(o.getCreatedBy() != null ? o.getCreatedBy().getUsername() : null);
        r.setCreatedAt(o.getCreatedAt());
        r.setCompletedAt(o.getCompletedAt());

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        for (OrderItem item : o.getItems()) {
            itemResponses.add(toItemResponse(item));
        }
        r.setItems(itemResponses);

        return r;
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        OrderItemResponse ir = new OrderItemResponse();
        ir.setId(item.getId());
        ir.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        ir.setItemName(item.getItemName());
        ir.setItemPrice(item.getItemPrice());
        ir.setQuantity(item.getQuantity());
        ir.setGstPercent(item.getGstPercent());
        ir.setSubtotal(item.getSubtotal());
        ir.setIsCustom(item.getIsCustom());
        ir.setStatus(item.getStatus());
        ir.setNotes(item.getNotes());

        // ===== NEW: Variant info =====
        ir.setVariantName(item.getVariantName());

        // ===== NEW: Addons — deserialize JSON back to list =====
        if (item.getAddonsJson() != null && !item.getAddonsJson().isBlank()) {
            try {
                List<AddonSnapshot> addons = objectMapper.readValue(
                        item.getAddonsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(
                                List.class, AddonSnapshot.class));
                ir.setAddons(addons);
            } catch (Exception e) {
                ir.setAddons(new ArrayList<>());
            }
        } else {
            ir.setAddons(new ArrayList<>());
        }

        return ir;
    }
}