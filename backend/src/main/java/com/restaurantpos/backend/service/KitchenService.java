package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.KitchenStatusRequest;
import com.restaurantpos.backend.dto.response.KitchenItemResponse;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.OrderItemRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KitchenService {

    private final OrderItemRepository orderItemRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public KitchenService(OrderItemRepository orderItemRepo,
                          SimpMessagingTemplate messagingTemplate) {
        this.orderItemRepo = orderItemRepo;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Get all kitchen items: NEW and PREPARING across all running orders for this tenant.
     */
    public List<KitchenItemResponse> getKitchenItems() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<OrderItem> items = orderItemRepo.findByTenantIdAndStatusIn(
                tenantId,
                List.of(OrderItemStatus.NEW, OrderItemStatus.PREPARING));
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Get all READY items (for waiters to pick up and serve).
     */
    public List<KitchenItemResponse> getReadyItems() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<OrderItem> items = orderItemRepo.findByTenantIdAndStatusIn(
                tenantId,
                List.of(OrderItemStatus.READY));
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Chef updates item status: NEW → PREPARING → READY.
     * Broadcasts via WebSocket for live kitchen screens.
     */
    @Transactional
    public KitchenItemResponse updateItemStatus(Long itemId, KitchenStatusRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        OrderItem item = orderItemRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Multi-tenant guard: ensure item belongs to this tenant
        if (!item.getOrder().getTenant().getId().equals(tenantId))
            throw new ResourceNotFoundException("Item not found");

        OrderItemStatus newStatus = req.getStatus();
        OrderItemStatus currentStatus = item.getStatus();

        // Validate state transitions
        if (currentStatus == OrderItemStatus.CANCELLED)
            throw new BadRequestException("Cannot update a cancelled item");
        if (currentStatus == OrderItemStatus.SERVED)
            throw new BadRequestException("Item is already served");

        // Kitchen can only set PREPARING or READY
        if (newStatus != OrderItemStatus.PREPARING && newStatus != OrderItemStatus.READY)
            throw new BadRequestException("Kitchen can only set status to PREPARING or READY");

        item.setStatus(newStatus);
        item = orderItemRepo.save(item);

        KitchenItemResponse response = toResponse(item);

        // Broadcast live update to tenant-specific topic
        messagingTemplate.convertAndSend("/topic/kitchen/" + tenantId, response);

        return response;
    }

    /**
     * Waiter marks item as SERVED (after delivering to table).
     */
    @Transactional
    public KitchenItemResponse serveItem(Long orderId, Long itemId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        OrderItem item = orderItemRepo.findByIdAndOrderId(itemId, orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in this order"));

        if (!item.getOrder().getTenant().getId().equals(tenantId))
            throw new ResourceNotFoundException("Item not found");

        if (item.getStatus() != OrderItemStatus.READY)
            throw new BadRequestException("Item must be READY before it can be served");

        item.setStatus(OrderItemStatus.SERVED);
        item = orderItemRepo.save(item);

        KitchenItemResponse response = toResponse(item);

        // Broadcast so kitchen/waiter dashboards update
        messagingTemplate.convertAndSend("/topic/kitchen/" + tenantId, response);

        return response;
    }

    /**
     * Called by OrderService when new items are added to an order.
     * Broadcasts each new item so kitchen screens update live.
     */
    public void broadcastNewItem(OrderItem item) {
        Long tenantId = item.getOrder().getTenant().getId();
        KitchenItemResponse response = toResponse(item);
        messagingTemplate.convertAndSend("/topic/kitchen/" + tenantId, response);
    }

    // ========== Helper ==========
    private KitchenItemResponse toResponse(OrderItem item) {
        KitchenItemResponse r = new KitchenItemResponse();
        r.setItemId(item.getId());
        r.setOrderId(item.getOrder().getId());
        r.setOrderNumber(item.getOrder().getOrderNumber());
        r.setOrderType(item.getOrder().getOrderType());
        if (item.getOrder().getTable() != null) {
            r.setTableNumber(item.getOrder().getTable().getTableNumber());
        }
        r.setItemName(item.getItemName());
        r.setQuantity(item.getQuantity());
        r.setStatus(item.getStatus());
        r.setNotes(item.getNotes());
        r.setIsCustom(item.getIsCustom());
        r.setOrderedAt(item.getCreatedAt());
        return r;
    }
}