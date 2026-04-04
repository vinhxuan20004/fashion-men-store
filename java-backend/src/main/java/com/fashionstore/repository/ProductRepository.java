package com.fashionstore.repository;

import com.fashionstore.model.Category;
import com.fashionstore.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySlug(String slug);
    
    Page<Product> findByCategory(Category category, Pageable pageable);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    Page<Product> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
}
