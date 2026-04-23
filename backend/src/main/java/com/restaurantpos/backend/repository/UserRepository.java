package com.restaurantpos.backend.repository;

import com.restaurantpos.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndTenantId(String username, Long tenantId);
    boolean existsByUsernameAndTenantId(String username, Long tenantId);
}