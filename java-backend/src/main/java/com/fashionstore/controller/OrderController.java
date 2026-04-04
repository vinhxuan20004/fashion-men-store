package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.dto.OrderRequest;
import com.fashionstore.model.Order;
import com.fashionstore.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(orderService.createOrder(orderRequest, username)));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(username)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(ApiResponse.success(order)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, status)));
    }
}
