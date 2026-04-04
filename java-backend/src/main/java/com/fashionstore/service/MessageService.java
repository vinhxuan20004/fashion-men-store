package com.fashionstore.service;

import com.fashionstore.model.Message;
import java.util.List;
import java.util.Optional;

public interface MessageService {
    Message sendMessage(Message message);
    List<Message> getAllMessages();
    List<Message> getConversationHistory(String email);
    Message replyToMessage(String id, String replyMessage);
    void updateStatus(String id, String status);
    void deleteMessage(String id);
}
