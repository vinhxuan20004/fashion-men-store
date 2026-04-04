package com.fashionstore.service.impl;

import com.fashionstore.model.Message;
import com.fashionstore.repository.MessageRepository;
import com.fashionstore.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public Message sendMessage(Message message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setStatus("UNREAD");
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Message> getConversationHistory(String email) {
        return messageRepository.findByEmailOrderByCreatedAtDesc(email);
    }

    @Override
    public Message replyToMessage(String id, String replyMessage) {
        Message message = messageRepository.findById(id).orElseThrow();
        Message.Reply reply = new Message.Reply(replyMessage, LocalDateTime.now());
        message.setReply(reply);
        message.setStatus("REPLIED");
        return messageRepository.save(message);
    }

    @Override
    public void updateStatus(String id, String status) {
        Message message = messageRepository.findById(id).orElseThrow();
        message.setStatus(status);
        messageRepository.save(message);
    }

    @Override
    public void deleteMessage(String id) {
        messageRepository.deleteById(id);
    }
}
