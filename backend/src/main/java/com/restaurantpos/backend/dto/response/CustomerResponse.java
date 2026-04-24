package com.restaurantpos.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerResponse {

    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String notes;
    private Integer visitCount;
    private BigDecimal totalSpent;
    private LocalDateTime lastVisitAt;
    private Boolean vip;
    private LocalDateTime createdAt;

    public CustomerResponse() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getVisitCount() { return visitCount; }
    public void setVisitCount(Integer visitCount) { this.visitCount = visitCount; }

    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }

    public LocalDateTime getLastVisitAt() { return lastVisitAt; }
    public void setLastVisitAt(LocalDateTime lastVisitAt) { this.lastVisitAt = lastVisitAt; }

    public Boolean getVip() { return vip; }
    public void setVip(Boolean vip) { this.vip = vip; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}