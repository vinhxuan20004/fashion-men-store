package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.model.Cart;
import com.fashionstore.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCart() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCartByUsername(username)));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestParam String productId,
            @RequestParam String variantId,
            @RequestParam(defaultValue = "1") int quantity) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.addToCart(username, productId, variantId, quantity)));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestParam String id) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.removeFromCart(username, id)));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(
            @RequestParam String id,
            @RequestParam int quantity) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.updateQuantity(username, id, quantity)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.clearCart(username)));
    }

    @PostMapping("/apply-voucher")
    public ResponseEntity<?> applyVoucher(@RequestParam String code) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(cartService.applyVoucher(username, code)));
    }
}
