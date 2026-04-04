package com.fashionstore.repository;

import com.fashionstore.model.Order;
import com.fashionstore.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUser(User user);
    List<Order> findByOrderStatus(String orderStatus);
    List<Order> findByPaymentStatus(String paymentStatus);
}
