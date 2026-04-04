package com.fashionstore.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private Double price;
    private Double salePrice;
    private String categoryId;
    private List<String> images;
    private List<VariantRequest> variants;
    private boolean isFeatured;
    private boolean isActive = true;
    private List<String> tags;
    private String material;
    private String brand;

    @Data
    public static class VariantRequest {
        private String size;
        private String color;
        private String colorCode;
        private int stock;
        private String sku;
    }
}
