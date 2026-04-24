package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecipeItemRepository extends JpaRepository<RecipeItem, Long> {

    List<RecipeItem> findByProductIdAndTenantId(Long productId, Long tenantId);

    Optional<RecipeItem> findByProductIdAndIngredientIdAndTenantId(
            Long productId, Long ingredientId, Long tenantId);
}