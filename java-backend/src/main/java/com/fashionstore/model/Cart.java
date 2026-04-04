package com.fashionstore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.util.StringUtils;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    private String id;

    @DBRef
    @Indexed(unique = true)
    private User user;

    private List<CartItem> items = new ArrayList<>();
    
    @DBRef
    private Voucher voucher;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public int getTotalItems() {
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }

    public double getSubtotal() {
        return items.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
    }

    public double getDiscount() {
        if (voucher == null) return 0;
        double subtotal = getSubtotal();
        if (voucher.getType().equals("PERCENTAGE")) {
            return subtotal * (voucher.getValue() / 100.0);
        } else {
            return voucher.getValue();
        }
    }

    public double getTotal() {
        return Math.max(0, getSubtotal() - getDiscount());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItem {
        private String id; // Unique ID for the cart item
        @DBRef
        private Product product;
        private String variantId;
        private VariantInfo variant;
        private int quantity;
        private double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantInfo {
        private String size;
        private String color;
    }
}
