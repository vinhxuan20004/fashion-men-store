package com.fashionstore.service;

import com.fashionstore.model.SiteSetting;
import java.util.List;
import java.util.Optional;

public interface SiteSettingService {
    Optional<SiteSetting> getByKey(String key);
    List<SiteSetting> getByGroup(String group);
    List<SiteSetting> getAll();
    SiteSetting update(SiteSetting setting);
    void updateMultiple(List<SiteSetting> settings);
}
