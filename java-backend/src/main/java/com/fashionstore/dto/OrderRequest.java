package com.fashionstore.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private List<OrderItemRequest> items;
    private String paymentMethod;
    private String fullName;
    private String phone;
    private String street;
    private String district;
    private String city;
    private String notes;
    private String voucherCode;

    @Data
    public static class OrderItemRequest {
        private String productId;
        private String variantId;
        private String size;
        private String color;
        private int quantity;
    }
}
