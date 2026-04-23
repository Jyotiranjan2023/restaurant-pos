package com.restaurantpos.backend.dto.response;

import com.restaurantpos.backend.enums.TableStatus;

public class TableResponse {

    private Long id;
    private Integer tableNumber;
    private String tableName;
    private Integer capacity;
    private TableStatus status;
    private Boolean active;

    public TableResponse() {}

    public TableResponse(Long id, Integer tableNumber, String tableName,
                         Integer capacity, TableStatus status, Boolean active) {
        this.id = id;
        this.tableNumber = tableNumber;
        this.tableName = tableName;
        this.capacity = capacity;
        this.status = status;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public TableStatus getStatus() { return status; }
    public void setStatus(TableStatus status) { this.status = status; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}