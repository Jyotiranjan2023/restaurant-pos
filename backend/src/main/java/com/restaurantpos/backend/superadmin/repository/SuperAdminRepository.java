package com.restaurantpos.backend.superadmin.repository;

import com.restaurantpos.backend.superadmin.entity.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {

    Optional<SuperAdmin> findByUsername(String username);

    Optional<SuperAdmin> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}