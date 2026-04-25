package com.restaurantpos.backend.entity;

import com.restaurantpos.backend.enums.OrderItemStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // For menu items: link to product. For custom items: null + use itemName/itemPrice below.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Snapshot of name & price at time of ordering (protects against later menu changes)
    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal itemPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 5, scale = 2)
    private BigDecimal gstPercent = BigDecimal.ZERO;

    // ===== NEW: Variant snapshot =====
    @Column(name = "variant_id")
    private Long variantId;   // reference (nullable)

    @Column(name = "variant_name")
    private String variantName;   // snapshot — "Large"

    // ===== NEW: Addons snapshot (JSON) =====
    @Column(name = "addons_json", columnDefinition = "TEXT")
    private String addonsJson;   // e.g., '[{"id":5,"name":"Extra Cheese","price":50.00}]'

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;   // itemPrice * quantity

    @Column(nullable = false)
    private Boolean isCustom = false;   // true for "Open Items"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderItemStatus status = OrderItemStatus.NEW;

    private String notes;   // special instructions, e.g. "no onion"

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ===== NEW: Tenant for multi-tenant isolation =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // ===== Getters & Setters =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public OrderItemStatus getStatus() { return status; }
    public void setStatus(OrderItemStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getAddonsJson() { return addonsJson; }
    public void setAddonsJson(String addonsJson) { this.addonsJson = addonsJson; }

    public Tenant getTenant() { return tenant; }
    public void setTenant(Tenant tenant) { this.tenant = tenant; }
}