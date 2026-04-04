package com.fashionstore.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    private String id;
    
    private String name;
    private String email;
    private String message;
    private String status; // UNREAD, READ, REPLIED
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    private LocalDateTime createdAt;
    
    private Reply reply;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reply {
        private String message;
        private LocalDateTime repliedAt;
    }
}
