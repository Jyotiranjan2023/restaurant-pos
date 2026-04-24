package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.IngredientRequest;
import com.restaurantpos.backend.dto.request.RecipeItemRequest;
import com.restaurantpos.backend.dto.request.RestockRequest;
import com.restaurantpos.backend.dto.response.IngredientResponse;
import com.restaurantpos.backend.dto.response.RecipeItemResponse;
import com.restaurantpos.backend.dto.response.UsageLogResponse;
import com.restaurantpos.backend.entity.*;
import com.restaurantpos.backend.enums.UsageLogType;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.*;
import com.restaurantpos.backend.security.TenantContext;
import com.restaurantpos.backend.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final IngredientRepository ingredientRepo;
    private final RecipeItemRepository recipeRepo;
    private final StockUsageLogRepository logRepo;
    private final ProductRepository productRepo;
    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;

    public InventoryService(IngredientRepository ingredientRepo,
                            RecipeItemRepository recipeRepo,
                            StockUsageLogRepository logRepo,
                            ProductRepository productRepo,
                            TenantRepository tenantRepo,
                            UserRepository userRepo) {
        this.ingredientRepo = ingredientRepo;
        this.recipeRepo = recipeRepo;
        this.logRepo = logRepo;
        this.productRepo = productRepo;
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
    }

    // ========== INGREDIENT CRUD ==========

    @Transactional
    public IngredientResponse createIngredient(IngredientRequest req) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        if (ingredientRepo.existsByNameAndTenantId(req.getName(), tenantId))
            throw new BadRequestException("Ingredient '" + req.getName() + "' already exists");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Ingredient ing = new Ingredient();
        ing.setName(req.getName());
        ing.setDescription(req.getDescription());
        ing.setUnit(req.getUnit());
        ing.setCurrentStock(req.getInitialStock() != null ? req.getInitialStock() : BigDecimal.ZERO);
        ing.setLowStockThreshold(req.getLowStockThreshold() != null ? req.getLowStockThreshold() : BigDecimal.ZERO);
        ing.setCostPerUnit(req.getCostPerUnit() != null ? req.getCostPerUnit() : BigDecimal.ZERO);
        ing.setTenant(tenant);
        ing = ingredientRepo.save(ing);

        // Log initial stock if any
        if (ing.getCurrentStock().compareTo(BigDecimal.ZERO) > 0) {
            User currentUser = userRepo.findById(principal.getUserId()).orElse(null);
            logStockChange(ing, UsageLogType.RESTOCK, ing.getCurrentStock(),
                    "Initial stock", currentUser, null, null, tenant);
        }

        return toIngredientResponse(ing);
    }

    public List<IngredientResponse> findAllIngredients() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ingredientRepo.findByTenantIdAndActiveTrueOrderByNameAsc(tenantId).stream()
                .map(this::toIngredientResponse)
                .collect(Collectors.toList());
    }

    public IngredientResponse findIngredientById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Ingredient ing = ingredientRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
        return toIngredientResponse(ing);
    }

    @Transactional
    public IngredientResponse updateIngredient(Long id, IngredientRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Ingredient ing = ingredientRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        // If name changing, check duplicates
        if (!ing.getName().equals(req.getName()) &&
            ingredientRepo.existsByNameAndTenantId(req.getName(), tenantId)) {
            throw new BadRequestException("Ingredient '" + req.getName() + "' already exists");
        }

        ing.setName(req.getName());
        ing.setDescription(req.getDescription());
        ing.setUnit(req.getUnit());
        if (req.getLowStockThreshold() != null) ing.setLowStockThreshold(req.getLowStockThreshold());
        if (req.getCostPerUnit() != null) ing.setCostPerUnit(req.getCostPerUnit());
        // Note: currentStock is NOT updated here. Use /restock endpoint instead.

        return toIngredientResponse(ingredientRepo.save(ing));
    }

    @Transactional
    public void deleteIngredient(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Ingredient ing = ingredientRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));
        ing.setActive(false);
        ingredientRepo.save(ing);
    }

    public List<IngredientResponse> findLowStockIngredients() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ingredientRepo.findLowStockByTenantId(tenantId).stream()
                .map(this::toIngredientResponse)
                .collect(Collectors.toList());
    }

    // ========== RESTOCK ==========

    @Transactional
    public IngredientResponse restock(Long ingredientId, RestockRequest req) {
        UserPrincipal principal = TenantContext.getCurrentUser();
        Long tenantId = principal.getTenantId();

        Ingredient ing = ingredientRepo.findByIdAndTenantId(ingredientId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        BigDecimal newStock = ing.getCurrentStock().add(req.getQuantity());
        ing.setCurrentStock(newStock);
        ing = ingredientRepo.save(ing);

        User currentUser = userRepo.findById(principal.getUserId()).orElse(null);
        Tenant tenant = tenantRepo.findById(tenantId).orElse(null);

        logStockChange(ing, UsageLogType.RESTOCK, req.getQuantity(),
                req.getNotes(), currentUser, null, null, tenant);

        return toIngredientResponse(ing);
    }

    // ========== RECIPE MANAGEMENT ==========

    @Transactional
    public RecipeItemResponse addRecipeItem(Long productId, RecipeItemRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Product product = productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Ingredient ingredient = ingredientRepo.findByIdAndTenantId(req.getIngredientId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        // If already in recipe, update quantity instead of creating duplicate
        RecipeItem existing = recipeRepo
                .findByProductIdAndIngredientIdAndTenantId(productId, req.getIngredientId(), tenantId)
                .orElse(null);

        Tenant tenant = tenantRepo.findById(tenantId).orElse(null);

        RecipeItem item;
        if (existing != null) {
            existing.setQuantityPerServing(req.getQuantityPerServing());
            item = recipeRepo.save(existing);
        } else {
            item = new RecipeItem();
            item.setProduct(product);
            item.setIngredient(ingredient);
            item.setQuantityPerServing(req.getQuantityPerServing());
            item.setTenant(tenant);
            item = recipeRepo.save(item);
        }

        return toRecipeItemResponse(item);
    }

    public List<RecipeItemResponse> getRecipe(Long productId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        // verify product belongs to tenant
        productRepo.findByIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return recipeRepo.findByProductIdAndTenantId(productId, tenantId).stream()
                .map(this::toRecipeItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeRecipeItem(Long productId, Long ingredientId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        RecipeItem item = recipeRepo
                .findByProductIdAndIngredientIdAndTenantId(productId, ingredientId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not in this recipe"));

        recipeRepo.delete(item);
    }

    // ========== AUTO-DEDUCTION (called by OrderService) ==========

    /**
     * Called when an order item is added. Deducts all ingredients used by this product,
     * multiplied by the ordered quantity.
     * Does NOTHING if product has no recipe (silent — not every item is tracked in inventory).
     */
    @Transactional
    public void deductStockForOrderItem(OrderItem orderItem) {
        // Custom items have no product → skip
        if (Boolean.TRUE.equals(orderItem.getIsCustom())) return;
        if (orderItem.getProduct() == null) return;

        Long tenantId = orderItem.getOrder().getTenant().getId();
        Long productId = orderItem.getProduct().getId();

        List<RecipeItem> recipe = recipeRepo.findByProductIdAndTenantId(productId, tenantId);
        if (recipe.isEmpty()) return;   // no recipe set — no deduction

        User performedBy = orderItem.getOrder().getCreatedBy();
        Tenant tenant = orderItem.getOrder().getTenant();
        BigDecimal orderQty = BigDecimal.valueOf(orderItem.getQuantity());

        for (RecipeItem ri : recipe) {
            Ingredient ing = ri.getIngredient();
            BigDecimal totalNeeded = ri.getQuantityPerServing().multiply(orderQty)
                    .setScale(3, RoundingMode.HALF_UP);
            BigDecimal newStock = ing.getCurrentStock().subtract(totalNeeded);

            // Note: we allow stock to go negative (business decision — don't block orders).
            // A stricter system could throw here. For now, just log it.
            ing.setCurrentStock(newStock);
            ingredientRepo.save(ing);

            logStockChange(ing, UsageLogType.CONSUMPTION, totalNeeded.negate(),
                    "Used for " + orderItem.getItemName(), performedBy,
                    orderItem.getOrder(), orderItem, tenant);
        }
    }

    // ========== USAGE LOGS ==========

    public List<UsageLogResponse> findAllUsageLogs() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return logRepo.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toUsageLogResponse)
                .collect(Collectors.toList());
    }

    public List<UsageLogResponse> findTodaysUsageLogs() {
        Long tenantId = TenantContext.getCurrentTenantId();
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);
        return logRepo.findByTenantIdAndDateRange(tenantId, start, end).stream()
                .map(this::toUsageLogResponse)
                .collect(Collectors.toList());
    }

    // ========== HELPERS ==========

    private void logStockChange(Ingredient ing, UsageLogType type, BigDecimal qtyChange,
                                String notes, User performedBy, Order order,
                                OrderItem orderItem, Tenant tenant) {
        StockUsageLog log = new StockUsageLog();
        log.setIngredient(ing);
        log.setType(type);
        log.setQuantityChange(qtyChange);
        log.setStockAfter(ing.getCurrentStock());
        log.setOrder(order);
        log.setOrderItem(orderItem);
        log.setNotes(notes);
        log.setPerformedBy(performedBy);
        log.setTenant(tenant);
        logRepo.save(log);
    }

    private IngredientResponse toIngredientResponse(Ingredient i) {
        IngredientResponse r = new IngredientResponse();
        r.setId(i.getId());
        r.setName(i.getName());
        r.setDescription(i.getDescription());
        r.setUnit(i.getUnit());
        r.setCurrentStock(i.getCurrentStock());
        r.setLowStockThreshold(i.getLowStockThreshold());
        r.setCostPerUnit(i.getCostPerUnit());
        r.setLowStockAlert(i.getCurrentStock().compareTo(i.getLowStockThreshold()) <= 0);
        return r;
    }

    private RecipeItemResponse toRecipeItemResponse(RecipeItem ri) {
        RecipeItemResponse r = new RecipeItemResponse();
        r.setId(ri.getId());
        r.setIngredientId(ri.getIngredient().getId());
        r.setIngredientName(ri.getIngredient().getName());
        r.setUnit(ri.getIngredient().getUnit());
        r.setQuantityPerServing(ri.getQuantityPerServing());
        return r;
    }

    private UsageLogResponse toUsageLogResponse(StockUsageLog log) {
        UsageLogResponse r = new UsageLogResponse();
        r.setId(log.getId());
        r.setIngredientId(log.getIngredient().getId());
        r.setIngredientName(log.getIngredient().getName());
        r.setUnit(log.getIngredient().getUnit());
        r.setType(log.getType());
        r.setQuantityChange(log.getQuantityChange());
        r.setStockAfter(log.getStockAfter());
        if (log.getOrder() != null) {
            r.setOrderId(log.getOrder().getId());
            r.setOrderNumber(log.getOrder().getOrderNumber());
        }
        r.setNotes(log.getNotes());
        r.setPerformedByUsername(log.getPerformedBy() != null ? log.getPerformedBy().getUsername() : null);
        r.setCreatedAt(log.getCreatedAt());
        return r;
    }
}