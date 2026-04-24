package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.Role;
import java.math.BigDecimal;

public class StaffReportResponse {

    private Long userId;
    private String username;
    private String fullName;
    private Role role;
    private Long ordersHandled;
    private BigDecimal totalSales;

    public StaffReportResponse() {}

    public StaffReportResponse(Long userId, String username, String fullName, Role role,
                               Long ordersHandled, BigDecimal totalSales) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.ordersHandled = ordersHandled;
        this.totalSales = totalSales;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getOrdersHandled() { return ordersHandled; }
    public void setOrdersHandled(Long ordersHandled) { this.ordersHandled = ordersHandled; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
}