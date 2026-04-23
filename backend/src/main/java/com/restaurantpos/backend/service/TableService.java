package com.restaurantpos.backend.service;

import com.restaurantpos.backend.dto.request.TableRequest;
import com.restaurantpos.backend.dto.request.TableStatusRequest;
import com.restaurantpos.backend.dto.response.TableResponse;
import com.restaurantpos.backend.entity.RestaurantTable;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.RestaurantTableRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TableService {

    private final RestaurantTableRepository tableRepo;
    private final TenantRepository tenantRepo;

    public TableService(RestaurantTableRepository tableRepo, TenantRepository tenantRepo) {
        this.tableRepo = tableRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public TableResponse create(TableRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (tableRepo.existsByTableNumberAndTenantId(req.getTableNumber(), tenantId))
            throw new BadRequestException("Table number " + req.getTableNumber() + " already exists");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(req.getTableNumber());
        table.setTableName(req.getTableName() != null ? req.getTableName()
                           : "Table " + req.getTableNumber());
        table.setCapacity(req.getCapacity() != null ? req.getCapacity() : 4);
        table.setTenant(tenant);

        return toResponse(tableRepo.save(table));
    }

    public List<TableResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return tableRepo.findByTenantIdAndActiveTrueOrderByTableNumberAsc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TableResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        RestaurantTable table = tableRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        return toResponse(table);
    }

    @Transactional
    public TableResponse update(Long id, TableRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        RestaurantTable table = tableRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        // If table number is changing, check for duplicates
        if (!table.getTableNumber().equals(req.getTableNumber()) &&
            tableRepo.existsByTableNumberAndTenantId(req.getTableNumber(), tenantId)) {
            throw new BadRequestException("Table number " + req.getTableNumber() + " already exists");
        }

        table.setTableNumber(req.getTableNumber());
        table.setTableName(req.getTableName());
        if (req.getCapacity() != null) table.setCapacity(req.getCapacity());

        return toResponse(tableRepo.save(table));
    }

    @Transactional
    public TableResponse updateStatus(Long id, TableStatusRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        RestaurantTable table = tableRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        table.setStatus(req.getStatus());
        return toResponse(tableRepo.save(table));
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        RestaurantTable table = tableRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (table.getStatus() == com.restaurantpos.backend.enums.TableStatus.RUNNING)
            throw new BadRequestException("Cannot delete table with a running order");

        table.setActive(false);
        tableRepo.save(table);
    }

    private TableResponse toResponse(RestaurantTable t) {
        return new TableResponse(
            t.getId(),
            t.getTableNumber(),
            t.getTableName(),
            t.getCapacity(),
            t.getStatus(),
            t.getActive()
        );
    }
}