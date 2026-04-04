package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.dto.JwtResponse;
import com.fashionstore.dto.LoginRequest;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.model.User;
import com.fashionstore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(jwtResponse));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully!", null));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(authService.getProfile(email)));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User profileData) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return ResponseEntity.ok(ApiResponse.success(authService.updateProfile(email, profileData)));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        authService.changePassword(email, payload.get("oldPassword"), payload.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success("Encryption key rotation complete.", null));
    }

    // Admin Endpoints
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(authService.getAllUsers(search, PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable String id, @RequestParam boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(authService.updateUserStatus(id, isActive)));
    }

    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.success(authService.updateUserRole(id, role)));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserAdmin(@PathVariable String id, @RequestBody User userData) {
        return ResponseEntity.ok(ApiResponse.success(authService.updateUserAdmin(id, userData)));
    }

    @PatchMapping("/admin/users/{id}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserPasswordAdmin(@PathVariable String id, @RequestBody Map<String, String> payload) {
        authService.updateUserPasswordAdmin(id, payload.get("password"));
        return ResponseEntity.ok(ApiResponse.success("Security credentials overridden.", null));
    }
}
