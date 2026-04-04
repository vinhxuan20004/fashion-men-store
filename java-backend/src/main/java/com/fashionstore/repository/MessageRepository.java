package com.fashionstore.repository;

import com.fashionstore.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByEmailOrderByCreatedAtDesc(String email);
    List<Message> findAllByOrderByCreatedAtDesc();
}
