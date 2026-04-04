package com.fashionstore.service.impl;

import com.fashionstore.model.Product;
import com.fashionstore.model.Review;
import com.fashionstore.model.User;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.ReviewRepository;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Review addReview(String email, String productId, int rating, String comment) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update product statistics
        product.setReviewCount(product.getReviewCount() + 1);
        product.setRatingSum(product.getRatingSum() + rating);
        productRepository.save(product);

        return savedReview;
    }

    @Override
    public List<Review> getReviewsByProduct(String productId) {
        Product product = productRepository.findById(productId).orElseThrow();
        return reviewRepository.findByProduct(product);
    }

    @Override
    @Transactional
    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id).orElseThrow();
        Product product = review.getProduct();

        // Update product statistics
        product.setReviewCount(Math.max(0, product.getReviewCount() - 1));
        product.setRatingSum(Math.max(0, product.getRatingSum() - review.getRating()));
        productRepository.save(product);

        reviewRepository.deleteById(id);
    }
}
