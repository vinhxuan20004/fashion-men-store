package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.model.Message;
import com.fashionstore.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Message message) {
        Message sentMessage = messageService.sendMessage(message);
        return ResponseEntity.ok(new ApiResponse<>(true, "Message sent successfully", sentMessage));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllMessages() {
        List<Message> messages = messageService.getAllMessages();
        Map<String, Object> data = new HashMap<>();
        data.put("messages", messages);
        return ResponseEntity.ok(new ApiResponse<>(true, "All messages retrieved", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/conversations")
    public ResponseEntity<?> getConversations() {
        List<Message> messages = messageService.getAllMessages();
        
        // Group by email and take the most recent message as representative
        List<Map<String, Object>> conversations = messages.stream()
                .collect(Collectors.groupingBy(Message::getEmail))
                .entrySet().stream()
                .map(entry -> {
                    Message lastMsg = entry.getValue().get(0); // Already sorted by date desc
                    Map<String, Object> conv = new HashMap<>();
                    conv.put("email", entry.getKey());
                    conv.put("name", lastMsg.getName());
                    conv.put("lastMessage", lastMsg.getMessage());
                    conv.put("lastCreatedAt", lastMsg.getCreatedAt());
                    conv.put("status", lastMsg.getStatus());
                    conv.put("unreadCount", (int) entry.getValue().stream().filter(m -> "UNREAD".equals(m.getStatus())).count());
                    return conv;
                })
                .sorted((a, b) -> ((java.time.LocalDateTime) b.get("lastCreatedAt")).compareTo((java.time.LocalDateTime) a.get("lastCreatedAt")))
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("conversations", conversations);
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversations retrieved", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/conversation/{email}")
    public ResponseEntity<?> getConversationHistory(@PathVariable String email) {
        List<Message> history = messageService.getConversationHistory(email);
        Map<String, Object> data = new HashMap<>();
        data.put("messages", history);
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversation history retrieved", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/{id}/reply")
    public ResponseEntity<?> reply(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String replyMessage = payload.get("message");
        Message updatedMessage = messageService.replyToMessage(id, replyMessage);
        Map<String, Object> data = new HashMap<>();
        data.put("message", updatedMessage);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reply sent", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        messageService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Message deleted", null));
    }
}
