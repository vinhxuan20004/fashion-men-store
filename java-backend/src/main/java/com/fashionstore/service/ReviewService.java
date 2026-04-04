package com.fashionstore.service;

import com.fashionstore.model.Review;
import java.util.List;

public interface ReviewService {
    Review addReview(String email, String productId, int rating, String comment);
    List<Review> getReviewsByProduct(String productId);
    void deleteReview(String id);
}
