package com.fashionstore.service.impl;

import com.fashionstore.dto.JwtResponse;
import com.fashionstore.dto.LoginRequest;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.model.User;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.security.JwtUtils;
import com.fashionstore.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        List<String> roles = userDetails.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getEmail())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }

    @Override
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role("USER")
                .isActive(true)
                .build();

        userRepository.save(user);
    }

    @Override
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }

    @Override
    public User updateProfile(String email, User profileData) {
        User user = getProfile(email);
        user.setName(profileData.getName());
        user.setPhone(profileData.getPhone());
        if (profileData.getAddress() != null) {
            user.setAddress(profileData.getAddress());
        }
        if (profileData.getAvatar() != null) {
            user.setAvatar(profileData.getAvatar());
        }
        return userRepository.save(user);
    }

    @Override
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = getProfile(email);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Error: Invalid current password.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public Page<User> getAllUsers(String search, Pageable pageable) {
        if (search != null && !search.isEmpty()) {
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Override
    public User updateUserStatus(String id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setActive(isActive);
        return userRepository.save(user);
    }

    @Override
    public User updateUserRole(String id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public User updateUserAdmin(String id, User userData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setName(userData.getName());
        user.setPhone(userData.getPhone());
        user.setRole(userData.getRole());
        user.setActive(userData.isActive());
        if (userData.getAddress() != null) {
            user.setAddress(userData.getAddress());
        }
        return userRepository.save(user);
    }

    @Override
    public void updateUserPasswordAdmin(String id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
