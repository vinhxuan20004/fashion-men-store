package com.fashionstore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String orderNumber;
    
    @DBRef
    private User user;
    
    private List<OrderItem> items;
    
    private Double subtotal;
    
    @Builder.Default
    private Double discountAmount = 0.0;
    @Builder.Default
    private Double shippingFee = 0.0;
    private Double total;
    
    private String paymentMethod; // COD, VNPAY, MOMO, BANK_TRANSFER
    
    @Builder.Default
    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED
    
    @Builder.Default
    private String orderStatus = "PENDING"; // PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED
    
    private ShippingAddress shippingAddress;
    
    @DBRef
    private Voucher voucher;
    private String voucherCode;
    
    private String notes;
    private String cancelReason;
    
    private LocalDateTime paidAt;
    private LocalDateTime deliveredAt;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        @DBRef
        private Product product;
        private String productName;
        private String productImage;
        private String variantId;
        private VariantInfo variant;
        private int quantity;
        private double price;
        private double totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantInfo {
        private String size;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddress {
        private String fullName;
        private String phone;
        private String street;
        private String district;
        private String city;
    }
}
