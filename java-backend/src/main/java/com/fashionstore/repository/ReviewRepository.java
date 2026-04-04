package com.fashionstore.repository;

import com.fashionstore.model.Product;
import com.fashionstore.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProduct(Product product);
}
