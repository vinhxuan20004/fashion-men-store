package com.fashionstore.repository;

import com.fashionstore.model.Cart;
import com.fashionstore.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUserEmail(String email);
}
