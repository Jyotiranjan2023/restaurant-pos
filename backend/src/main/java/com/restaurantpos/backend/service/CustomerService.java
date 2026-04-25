package com.restaurantpos.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.restaurantpos.backend.dto.request.CustomerRequest;
import com.restaurantpos.backend.dto.response.CustomerOrderHistoryResponse;
import com.restaurantpos.backend.dto.response.CustomerResponse;
import com.restaurantpos.backend.entity.Customer;
import com.restaurantpos.backend.entity.Order;
import com.restaurantpos.backend.entity.OrderItem;
import com.restaurantpos.backend.entity.Tenant;
import com.restaurantpos.backend.enums.OrderItemStatus;
import com.restaurantpos.backend.exception.BadRequestException;
import com.restaurantpos.backend.exception.ResourceNotFoundException;
import com.restaurantpos.backend.repository.CustomerRepository;
import com.restaurantpos.backend.repository.OrderRepository;
import com.restaurantpos.backend.repository.TenantRepository;
import com.restaurantpos.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final OrderRepository orderRepo;
    private final TenantRepository tenantRepo;

    public CustomerService(CustomerRepository customerRepo,
                           OrderRepository orderRepo,
                           TenantRepository tenantRepo) {
        this.customerRepo = customerRepo;
        this.orderRepo = orderRepo;
        this.tenantRepo = tenantRepo;
    }

    @Transactional
    public CustomerResponse create(CustomerRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (customerRepo.findByPhoneAndTenantId(req.getPhone(), tenantId).isPresent())
            throw new BadRequestException("Customer with phone " + req.getPhone() + " already exists");

        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Customer c = new Customer();
        c.setName(req.getName());
        c.setPhone(req.getPhone());
        c.setEmail(req.getEmail());
        c.setAddress(req.getAddress());
        c.setNotes(req.getNotes());
        c.setVip(Boolean.TRUE.equals(req.getVip()));
        c.setTenant(tenant);

        return toResponse(customerRepo.save(c));
    }

    public List<CustomerResponse> findAll() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return customerRepo.findByTenantIdAndActiveTrueOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse findById(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Customer c = customerRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return toResponse(c);
    }

    public CustomerResponse findByPhone(String phone) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Customer c = customerRepo.findByPhoneAndTenantId(phone, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return toResponse(c);
    }

    public List<CustomerResponse> search(String query) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (query == null || query.isBlank())
            return findAll();
        return customerRepo.searchByTenantIdAndQuery(tenantId, query.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Customer c = customerRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Check phone uniqueness if changed
        if (!c.getPhone().equals(req.getPhone())) {
            customerRepo.findByPhoneAndTenantId(req.getPhone(), tenantId).ifPresent(other -> {
                if (!other.getId().equals(id))
                    throw new BadRequestException("Another customer already uses phone " + req.getPhone());
            });
        }

        c.setName(req.getName());
        c.setPhone(req.getPhone());
        c.setEmail(req.getEmail());
        c.setAddress(req.getAddress());
        c.setNotes(req.getNotes());
        if (req.getVip() != null) c.setVip(req.getVip());

        return toResponse(customerRepo.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Customer c = customerRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        c.setActive(false);
        customerRepo.save(c);
    }

    public List<CustomerOrderHistoryResponse> getOrderHistory(Long customerId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        // verify customer belongs to tenant
        customerRepo.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return orderRepo.findByCustomerIdAndTenantIdOrderByCreatedAtDesc(customerId, tenantId).stream()
                .map(this::toOrderHistory)
                .collect(Collectors.toList());
    }

    public List<CustomerResponse> getTopSpenders() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return customerRepo.findTopSpendersByTenantId(tenantId).stream()
                .limit(20)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ========== Called by OrderService ==========

    /**
     * Find or create a customer based on phone number.
     * Called when creating an order with customerPhone.
     * Returns null if phone is not provided.
     */
    @Transactional
    public Customer findOrCreateByPhone(String phone, String name, String address, Long tenantId) {
        if (phone == null || phone.isBlank()) return null;

        return customerRepo.findByPhoneAndTenantId(phone, tenantId)
                .orElseGet(() -> {
                    Tenant tenant = tenantRepo.findById(tenantId).orElse(null);
                    if (tenant == null) return null;

                    Customer c = new Customer();
                    c.setName(name != null ? name : "Walk-in");
                    c.setPhone(phone);
                    c.setAddress(address);
                    c.setTenant(tenant);
                    return customerRepo.save(c);
                });
    }

    /**
     * Called when a bill is settled — update customer aggregates.
     */
    @Transactional
    public void recordVisit(Customer customer, BigDecimal amount) {
        if (customer == null) return;

        customer.setVisitCount(customer.getVisitCount() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(amount));
        customer.setLastVisitAt(LocalDateTime.now());
        customerRepo.save(customer);
    }

    // ========== Helpers ==========

    private CustomerResponse toResponse(Customer c) {
        CustomerResponse r = new CustomerResponse();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setPhone(c.getPhone());
        r.setEmail(c.getEmail());
        r.setAddress(c.getAddress());
        r.setNotes(c.getNotes());
        r.setVisitCount(c.getVisitCount());
        r.setTotalSpent(c.getTotalSpent());
        r.setLastVisitAt(c.getLastVisitAt());
        r.setVip(c.getVip());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }

    private CustomerOrderHistoryResponse toOrderHistory(Order o) {
        int itemCount = 0;
        for (OrderItem item : o.getItems()) {
            if (item.getStatus() != OrderItemStatus.CANCELLED) {
                itemCount += item.getQuantity();
            }
        }
        return new CustomerOrderHistoryResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getOrderType(),
                o.getStatus(),
                itemCount,
                o.getTotalAmount(),
                o.getCreatedAt()
        );
    }
    
    public Page<CustomerResponse> findAllPaginated(int page, int size, String sortBy, String direction) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (size > 100) size = 100;
        if (size < 1) size = 20;
        if (page < 0) page = 0;

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return customerRepo.findByTenantIdAndActiveTrue(tenantId, pageable)
                .map(this::toResponse);
    }
}