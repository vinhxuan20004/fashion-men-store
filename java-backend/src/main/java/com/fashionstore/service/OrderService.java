package com.fashionstore.service;

import com.fashionstore.dto.OrderRequest;
import com.fashionstore.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order createOrder(OrderRequest orderRequest, String username);
    List<Order> getMyOrders(String username);
    Optional<Order> getOrderById(String id);
    List<Order> getAllOrders();
    Order updateOrderStatus(String id, String status);
}
