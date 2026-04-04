package com.fashionstore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "vouchers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String code;
    
    private String description;
    private String type; // PERCENTAGE, FIXED
    private Double value;
    
    private Double maxDiscountAmount;
    private Double minOrderValue;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    private Integer usageLimit;
    private Integer usedCount = 0;
    
    @Builder.Default
    private boolean isActive = true;

    public boolean isExpired() {
        return endDate != null && endDate.isBefore(LocalDateTime.now());
    }
}
