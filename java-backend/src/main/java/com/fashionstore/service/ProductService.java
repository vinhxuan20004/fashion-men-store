package com.fashionstore.service;

import com.fashionstore.dto.ProductRequest;
import com.fashionstore.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ProductService {
    Page<Product> getAllProducts(String categoryId, String search, Double minPrice, Double maxPrice, Pageable pageable);
    Optional<Product> getProductById(String id);
    Optional<Product> getProductBySlug(String slug);
    Product createProduct(ProductRequest productRequest);
    Product updateProduct(String id, ProductRequest productRequest);
    void deleteProduct(String id);
}
