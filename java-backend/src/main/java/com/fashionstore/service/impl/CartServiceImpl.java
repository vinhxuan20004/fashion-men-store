package com.fashionstore.service.impl;

import com.fashionstore.model.Cart;
import com.fashionstore.model.Product;
import com.fashionstore.model.User;
import com.fashionstore.model.Voucher;
import com.fashionstore.repository.CartRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.repository.VoucherRepository;
import com.fashionstore.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public Cart getCartByUsername(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    @Override
    public Cart addToCart(String email, String productId, String variantId, int quantity) {
        Cart cart = getCartByUsername(email);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Find variant info from product
        Product.Variant variant = product.getVariants().stream()
                .filter(v -> v.getId() != null && v.getId().equals(variantId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        Optional<Cart.CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId) && 
                        variantId.equals(item.getVariantId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            double price = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            Cart.CartItem newItem = Cart.CartItem.builder()
                    .id(UUID.randomUUID().toString())
                    .product(product)
                    .variantId(variantId)
                    .variant(new Cart.VariantInfo(variant.getSize(), variant.getColor()))
                    .quantity(quantity)
                    .price(price)
                    .build();
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    @Override
    public Cart removeFromCart(String email, String id) {
        Cart cart = getCartByUsername(email);
        cart.getItems().removeIf(item -> id.equals(item.getId()));
        return cartRepository.save(cart);
    }

    @Override
    public Cart clearCart(String email) {
        Cart cart = getCartByUsername(email);
        cart.getItems().clear();
        cart.setVoucher(null);
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateQuantity(String email, String id, int quantity) {
        Cart cart = getCartByUsername(email);
        cart.getItems().stream()
                .filter(item -> id.equals(item.getId()))
                .forEach(item -> item.setQuantity(quantity));
        return cartRepository.save(cart);
    }

    @Override
    public Cart applyVoucher(String email, String code) {
        Cart cart = getCartByUsername(email);
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Error: Voucher invalid or expired."));

        if (!voucher.isActive()) {
            throw new RuntimeException("Error: Voucher is currently inactive.");
        }

        if (voucher.getEndDate() != null && voucher.getEndDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: Voucher has expired.");
        }

        if (cart.getSubtotal() < voucher.getMinOrderValue()) {
            throw new RuntimeException("Error: Minimum order value not reached.");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Error: Voucher usage limit exceeded.");
        }

        cart.setVoucher(voucher);
        return cartRepository.save(cart);
    }
}
