package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Feedback> findByBillIdAndTenantId(Long billId, Long tenantId);

    boolean existsByBillIdAndTenantId(Long billId, Long tenantId);

    Page<Feedback> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    List<Feedback> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.tenant.id = :tenantId")
    Double findAverageRatingByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT f.rating, COUNT(f) FROM Feedback f " +
           "WHERE f.tenant.id = :tenantId " +
           "GROUP BY f.rating ORDER BY f.rating DESC")
    List<Object[]> countByRatingForTenant(@Param("tenantId") Long tenantId);

    /**
     * Average rating for a specific product, computed across all feedback
     * where that product appeared in the order.
     */
    @Query("SELECT AVG(f.rating) FROM Feedback f " +
           "JOIN f.bill b " +
           "JOIN b.order o " +
           "JOIN o.items i " +
           "WHERE f.tenant.id = :tenantId " +
           "AND i.product.id = :productId " +
           "AND i.status <> com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED")
    Double findAverageRatingForProduct(
            @Param("tenantId") Long tenantId,
            @Param("productId") Long productId);

    @Query("SELECT COUNT(DISTINCT f.id) FROM Feedback f " +
           "JOIN f.bill b " +
           "JOIN b.order o " +
           "JOIN o.items i " +
           "WHERE f.tenant.id = :tenantId " +
           "AND i.product.id = :productId " +
           "AND i.status <> com.restaurantpos.backend.enums.OrderItemStatus.CANCELLED")
    Long countFeedbackForProduct(
            @Param("tenantId") Long tenantId,
            @Param("productId") Long productId);
}