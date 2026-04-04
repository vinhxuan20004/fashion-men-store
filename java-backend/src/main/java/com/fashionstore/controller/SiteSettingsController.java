package com.fashionstore.controller;

import com.fashionstore.dto.ApiResponse;
import com.fashionstore.model.SiteSetting;
import com.fashionstore.service.SiteSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site")
public class SiteSettingsController {

    @Autowired
    private SiteSettingService siteSettingService;

    @GetMapping("/settings")
    public ResponseEntity<?> getPublicSettings() {
        // Return selective settings for public view
        List<SiteSetting> settings = siteSettingService.getAll();
        Map<String, Object> data = new HashMap<>();
        data.put("settings", settings);
        return ResponseEntity.ok(new ApiResponse<>(true, "Settings retrieved", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/settings")
    public ResponseEntity<?> getAdminSettings(@RequestParam(required = false) String group) {
        List<SiteSetting> settings;
        if (group != null) {
            settings = siteSettingService.getByGroup(group);
        } else {
            settings = siteSettingService.getAll();
        }
        Map<String, Object> data = new HashMap<>();
        data.put("settings", settings);
        return ResponseEntity.ok(new ApiResponse<>(true, "Admin settings retrieved", data));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, List<SiteSetting>> payload) {
        List<SiteSetting> settings = payload.get("settings");
        if (settings != null) {
            siteSettingService.updateMultiple(settings);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Settings updated successfully", null));
    }
}
