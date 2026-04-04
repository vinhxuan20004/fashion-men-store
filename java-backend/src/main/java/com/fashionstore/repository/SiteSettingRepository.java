package com.fashionstore.repository;

import com.fashionstore.model.SiteSetting;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SiteSettingRepository extends MongoRepository<SiteSetting, String> {
    Optional<SiteSetting> findByKey(String key);
    List<SiteSetting> findByGroup(String group);
}
