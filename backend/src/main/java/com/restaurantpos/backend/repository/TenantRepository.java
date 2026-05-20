package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    Optional<Tenant> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.createdAt > :cutoff")
    long countByCreatedAtAfter(@Param("cutoff") java.time.LocalDateTime cutoff);

    @Query("SELECT t FROM Tenant t WHERE " +
           "(:search IS NULL OR LOWER(t.restaurantName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Tenant> searchByName(@Param("search") String search, Pageable pageable);
}