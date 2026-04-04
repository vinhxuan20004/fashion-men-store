package com.fashionstore.service.impl;

import com.fashionstore.model.SiteSetting;
import com.fashionstore.repository.SiteSettingRepository;
import com.fashionstore.service.SiteSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SiteSettingServiceImpl implements SiteSettingService {

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    @Override
    public Optional<SiteSetting> getByKey(String key) {
        return siteSettingRepository.findByKey(key);
    }

    @Override
    public List<SiteSetting> getByGroup(String group) {
        return siteSettingRepository.findByGroup(group);
    }

    @Override
    public List<SiteSetting> getAll() {
        return siteSettingRepository.findAll();
    }

    @Override
    public SiteSetting update(SiteSetting setting) {
        Optional<SiteSetting> existing = siteSettingRepository.findByKey(setting.getKey());
        if (existing.isPresent()) {
            SiteSetting s = existing.get();
            s.setValue(setting.getValue());
            s.setGroup(setting.getGroup());
            s.setDescription(setting.getDescription());
            return siteSettingRepository.save(s);
        }
        return siteSettingRepository.save(setting);
    }

    @Override
    public void updateMultiple(List<SiteSetting> settings) {
        settings.forEach(this::update);
    }
}
