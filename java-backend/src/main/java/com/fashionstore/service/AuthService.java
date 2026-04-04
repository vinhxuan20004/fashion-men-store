package com.fashionstore.service;

import com.fashionstore.dto.JwtResponse;
import com.fashionstore.dto.LoginRequest;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthService {
    JwtResponse login(LoginRequest loginRequest);
    void register(RegisterRequest registerRequest);
    
    // Admin & Profile Extensions
    User getProfile(String email);
    User updateProfile(String email, User profileData);
    void changePassword(String email, String oldPassword, String newPassword);
    
    // Admin Personnel Ledger
    Page<User> getAllUsers(String search, Pageable pageable);
    User updateUserStatus(String id, boolean isActive);
    User updateUserRole(String id, String role);
    User updateUserAdmin(String id, User userData);
    void updateUserPasswordAdmin(String id, String newPassword);
}
