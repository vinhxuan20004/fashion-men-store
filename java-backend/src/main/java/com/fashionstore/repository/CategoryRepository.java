package com.fashionstore.repository;

import com.fashionstore.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByName(String name);
    Optional<Category> findBySlug(String slug);
    Boolean existsByName(String name);
}
