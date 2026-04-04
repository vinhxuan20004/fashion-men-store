package com.fashionstore.service;

import com.fashionstore.model.Cart;
import java.util.Optional;

public interface CartService {
    Cart getCartByUsername(String email);
    Cart addToCart(String email, String productId, String variantId, int quantity);
    Cart removeFromCart(String email, String id);
    Cart clearCart(String email);
    Cart updateQuantity(String email, String id, int quantity);
    Cart applyVoucher(String email, String code);
}
