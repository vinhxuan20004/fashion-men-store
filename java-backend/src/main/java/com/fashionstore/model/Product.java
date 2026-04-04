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

@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String slug;
    
    private String description;
    private Double price;
    private Double salePrice;
    
    @DBRef
    private Category category;
    
    private List<String> images;
    
    private List<Variant> variants;
    
    @Builder.Default
    private int reviewCount = 0;
    @Builder.Default
    private int ratingSum = 0;
    
    @Builder.Default
    private boolean isFeatured = false;
    @Builder.Default
    private boolean isActive = true;
    
    private List<String> tags;
    private String material;
    private String brand;
    @Builder.Default
    private int soldCount = 0;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public double getAverageRating() {
        if (reviewCount == 0) return 0.0;
        return (double) ratingSum / reviewCount;
    }

    public int getTotalStock() {
        if (variants == null) return 0;
        return variants.stream().mapToInt(Variant::getStock).sum();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Variant {
        private String id;
        private String size;
        private String color;
        private String colorCode;
        private int stock;
        private String sku;
    }
}
