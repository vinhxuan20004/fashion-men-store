package com.fashionstore.service.impl;

import com.fashionstore.dto.ProductRequest;
import com.fashionstore.model.Category;
import com.fashionstore.model.Product;
import com.fashionstore.repository.CategoryRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Page<Product> getAllProducts(String categoryId, String search, Double minPrice, Double maxPrice, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return productRepository.findByNameContainingIgnoreCase(search, pageable);
        }
        
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId).orElse(null);
            if (category != null) {
                return productRepository.findByCategory(category, pageable);
            }
        }
        
        return productRepository.findAll(pageable);
    }

    @Override
    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    @Override
    public Optional<Product> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug);
    }

    @Override
    public Product createProduct(ProductRequest productRequest) {
        Category category = categoryRepository.findById(productRequest.getCategoryId()).orElseThrow();
        
        List<Product.Variant> variants = productRequest.getVariants().stream()
                .map(v -> new Product.Variant(java.util.UUID.randomUUID().toString(), v.getSize(), v.getColor(), v.getColorCode(), v.getStock(), v.getSku()))
                .collect(Collectors.toList());

        Product product = Product.builder()
                .name(productRequest.getName())
                .slug(com.fashionstore.utils.SlugUtil.generateSlug(productRequest.getName()))
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .salePrice(productRequest.getSalePrice())
                .category(category)
                .images(productRequest.getImages())
                .variants(variants)
                .isFeatured(productRequest.isFeatured())
                .isActive(productRequest.isActive())
                .tags(productRequest.getTags())
                .material(productRequest.getMaterial())
                .brand(productRequest.getBrand())
                .build();
                
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(String id, ProductRequest productRequest) {
        Product product = productRepository.findById(id).orElseThrow();
        Category category = categoryRepository.findById(productRequest.getCategoryId()).orElseThrow();
        
        List<Product.Variant> variants = productRequest.getVariants().stream()
                .map(v -> new Product.Variant(java.util.UUID.randomUUID().toString(), v.getSize(), v.getColor(), v.getColorCode(), v.getStock(), v.getSku()))
                .collect(Collectors.toList());

        product.setName(productRequest.getName());
        product.setSlug(com.fashionstore.utils.SlugUtil.generateSlug(productRequest.getName()));
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setSalePrice(productRequest.getSalePrice());
        product.setCategory(category);
        product.setImages(productRequest.getImages());
        product.setVariants(variants);
        product.setFeatured(productRequest.isFeatured());
        product.setActive(productRequest.isActive());
        product.setTags(productRequest.getTags());
        product.setMaterial(productRequest.getMaterial());
        product.setBrand(productRequest.getBrand());
        
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}
