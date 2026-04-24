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

import com.restaurantpos.backend.dto.request.AddItemsRequest;
import com.restaurantpos.backend.dto.request.CreateOrderRequest;
import com.restaurantpos.backend.dto.request.OrderItemRequest;
import com.restaurantpos.backend.dto.response.OrderItemResponse;
import com.restaurantpos.backend.dto.response.OrderResponse;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Product;
import com.restaurantpos.backend.entity.RestaurantTable;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.entity.User;
import com.restaurantpos.backend.enums.OrderStatus;
import com.restaurantpos.backend.enums.OrderType;
import com.restaurantpos.backend.enums.TableStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.ProductRepository;
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

    public OrderService(OrderRepository orderRepo,
            ProductRepository productRepo,
            RestaurantTableRepository tableRepo,
            UserRepository userRepo,
            TenantRepository tenantRepo,
            KitchenService kitchenService,
            InventoryService inventoryService) {   // ← NEW param
this.orderRepo = orderRepo;
this.productRepo = productRepo;
this.tableRepo = tableRepo;
this.userRepo = userRepo;
this.tenantRepo = tenantRepo;
this.kitchenService = kitchenService;
this.inventoryService = inventoryService;   // ← NEW assignment
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
            inventoryService.deductStockForOrderItem(item);   // ← NEW: auto-deduct
        }
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

    // ========== Helpers ==========

    private OrderItem buildOrderItem(OrderItemRequest req, Order order, Long tenantId) {
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setQuantity(req.getQuantity());
        item.setNotes(req.getNotes());
        item.setIsCustom(Boolean.TRUE.equals(req.getIsCustom()));

        if (Boolean.TRUE.equals(req.getIsCustom())) {
            // Custom / Open Item
            if (req.getItemName() == null || req.getItemName().isBlank())
                throw new BadRequestException("Item name is required for custom items");
            if (req.getItemPrice() == null || req.getItemPrice().compareTo(BigDecimal.ZERO) <= 0)
                throw new BadRequestException("Valid price is required for custom items");

            item.setItemName(req.getItemName());
            item.setItemPrice(req.getItemPrice());
            item.setGstPercent(req.getGstPercent() != null ? req.getGstPercent() : BigDecimal.ZERO);
        } else {
            // Menu Item
            if (req.getProductId() == null)
                throw new BadRequestException("Product ID is required for menu items");

            Product product = productRepo.findByIdAndTenantId(req.getProductId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            item.setProduct(product);
            item.setItemName(product.getName());
            item.setItemPrice(product.getPrice());
            item.setGstPercent(product.getGstPercent() != null ? product.getGstPercent() : BigDecimal.ZERO);
        }

        BigDecimal subtotal = item.getItemPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        item.setSubtotal(subtotal);

        return item;
    }

    private void recalculateTotals(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            // Skip cancelled items in total
            if (item.getStatus() == com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED) continue;

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
            itemResponses.add(ir);
        }
        r.setItems(itemResponses);

        return r;
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
        
        for (OrderItem item : order.getItems()) {
            if (item.getStatus() == com.restaurantpos.backend.enums.OrderItemStatus.NEW) {
                kitchenService.broadcastNewItem(item);
            }
        }

        return toResponse(order);
    }

    /**
     * Cancel a specific item in an order.
     * Marks item as CANCELLED; recalculates totals (cancelled items excluded).
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

        if (item.getStatus() == com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED)
            throw new BadRequestException("Item is already cancelled");

        if (item.getStatus() == com.restaurantpos.backend.enums.OrderItemStatus.SERVED)
            throw new BadRequestException("Cannot cancel an item that has already been served");

        item.setStatus(com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED);

        recalculateTotals(order);
        order = orderRepo.save(order);

        return toResponse(order);
    }

    /**
     * Cancel an entire order (ADMIN-only via @PreAuthorize in controller).
     * If the order was DINE_IN, the table goes back to AVAILABLE.
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
            if (item.getStatus() != com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED &&
                item.getStatus() != com.restaurantpos.backend.enums.OrderItemStatus.SERVED) {
                item.setStatus(com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED);
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
}