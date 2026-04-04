package com.fashionstore.service.impl;

import com.fashionstore.dto.OrderRequest;
import com.fashionstore.model.*;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.repository.VoucherRepository;
import com.fashionstore.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Override
    public Order createOrder(OrderRequest orderRequest, String username) {
        User user = userRepository.findByEmail(username).orElseThrow();
        
        List<Order.OrderItem> orderItems = orderRequest.getItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow();
            
            // Find and update specific variant stock using variantId if available, fallback to size/color
            Product.Variant variant = null;
            if (itemRequest.getVariantId() != null) {
                variant = product.getVariants().stream()
                        .filter(v -> itemRequest.getVariantId().equals(v.getId()))
                        .findFirst()
                        .orElse(null);
            }
            
            if (variant == null) {
                variant = product.getVariants().stream()
                        .filter(v -> v.getSize().equals(itemRequest.getSize()) && v.getColor().equals(itemRequest.getColor()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Variant not found: " + itemRequest.getVariantId() + " or " + itemRequest.getSize() + " " + itemRequest.getColor()));
            }

            if (variant.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " variant " + variant.getSize() + "/" + variant.getColor() + " is out of stock!");
            }
            
            variant.setStock(variant.getStock() - itemRequest.getQuantity());
            product.setSoldCount(product.getSoldCount() + itemRequest.getQuantity());
            productRepository.save(product);
            
            double itemPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            
            return new Order.OrderItem(
                    product,
                    product.getName(),
                    product.getImages().isEmpty() ? "" : product.getImages().get(0),
                    itemRequest.getVariantId(),
                    new Order.VariantInfo(variant.getSize(), variant.getColor()),
                    itemRequest.getQuantity(),
                    itemPrice,
                    itemPrice * itemRequest.getQuantity()
            );
        }).collect(Collectors.toList());
        
        double subtotal = orderItems.stream()
                .mapToDouble(Order.OrderItem::getTotalPrice)
                .sum();
        
        double discountAmount = 0.0;
        Voucher appliedVoucher = null;
        if (orderRequest.getVoucherCode() != null && !orderRequest.getVoucherCode().isEmpty()) {
            appliedVoucher = voucherRepository.findByCode(orderRequest.getVoucherCode()).orElse(null);
            if (appliedVoucher != null && appliedVoucher.isActive() && !appliedVoucher.isExpired()) {
                if (subtotal >= appliedVoucher.getMinOrderValue()) {
                    if ("PERCENTAGE".equals(appliedVoucher.getType())) {
                        discountAmount = (subtotal * appliedVoucher.getValue()) / 100;
                    } else {
                        discountAmount = appliedVoucher.getValue();
                    }
                    
                    if (appliedVoucher.getMaxDiscountAmount() != null && discountAmount > appliedVoucher.getMaxDiscountAmount()) {
                        discountAmount = appliedVoucher.getMaxDiscountAmount();
                    }
                    
                    // Update voucher usage
                    appliedVoucher.setUsedCount(appliedVoucher.getUsedCount() + 1);
                    voucherRepository.save(appliedVoucher);
                }
            }
        }
        
        Order order = Order.builder()
                .orderNumber(com.fashionstore.utils.OrderUtil.generateOrderNumber())
                .user(user)
                .items(orderItems)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(0.0) // Can be expanded later
                .total(subtotal - discountAmount)
                .paymentMethod(orderRequest.getPaymentMethod())
                .paymentStatus("PENDING")
                .orderStatus("PENDING")
                .shippingAddress(new Order.ShippingAddress(
                        orderRequest.getFullName(),
                        orderRequest.getPhone(),
                        orderRequest.getStreet(),
                        orderRequest.getDistrict(),
                        orderRequest.getCity()
                ))
                .voucher(appliedVoucher)
                .voucherCode(orderRequest.getVoucherCode())
                .notes(orderRequest.getNotes())
                .build();
                
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getMyOrders(String username) {
        User user = userRepository.findByEmail(username).orElseThrow();
        return orderRepository.findByUser(user);
    }

    @Override
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order updateOrderStatus(String id, String status) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }
}
