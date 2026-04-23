package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.dto.request.TableRequest;
import com.restaurantpos.backend.dto.request.TableStatusRequest;
import com.restaurantpos.backend.dto.response.ApiResponse;
import com.restaurantpos.backend.dto.response.TableResponse;
import com.restaurantpos.backend.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> create(@Valid @RequestBody TableRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Table created", tableService.create(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success("Tables fetched", tableService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Table fetched", tableService.findById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Table updated", tableService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TableResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TableStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                tableService.updateStatus(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted", null));
    }
}