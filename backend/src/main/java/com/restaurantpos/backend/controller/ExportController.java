package com.restaurantpos.backend.controller;

import com.restaurantpos.backend.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/export")
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/orders")
    public void exportOrders(
            @RequestParam String from,
            @RequestParam String to,
            HttpServletResponse response) throws IOException {
        exportService.exportOrders(from, to, response);
    }

    @GetMapping("/bills")
    public void exportBills(
            @RequestParam String from,
            @RequestParam String to,
            HttpServletResponse response) throws IOException {
        exportService.exportBills(from, to, response);
    }

    @GetMapping("/products")
    public void exportProducts(HttpServletResponse response) throws IOException {
        exportService.exportProducts(response);
    }

    @GetMapping("/customers")
    public void exportCustomers(HttpServletResponse response) throws IOException {
        exportService.exportCustomers(response);
    }

    @GetMapping("/sales")
    public void exportSales(
            @RequestParam String from,
            @RequestParam String to,
            HttpServletResponse response) throws IOException {
        exportService.exportSales(from, to, response);
    }

    @GetMapping("/gst")
    public void exportGst(
            @RequestParam String from,
            @RequestParam String to,
            HttpServletResponse response) throws IOException {
        exportService.exportGst(from, to, response);
    }
}