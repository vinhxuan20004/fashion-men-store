package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.dto.ProductRequest;
import com.fashionstore.model.Product;
import com.fashionstore.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort) {

        Sort.Direction direction = Sort.Direction.DESC;
        String sortBy = "createdAt";
        
        if (sort != null && sort.length >= 2) {
            sortBy = sort[0];
            direction = sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(categoryId, search, minPrice, maxPrice, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(ApiResponse.success(product)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        return productService.getProductBySlug(slug)
                .map(product -> ResponseEntity.ok(ApiResponse.success(product)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedProducts() {
        // Simple implementation: first 8 products marked featured
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(null, null, null, null, PageRequest.of(0, 8)).getContent()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(productRequest)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody ProductRequest productRequest) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, productRequest)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Resource successfully de-manifested.", null));
    }
}
