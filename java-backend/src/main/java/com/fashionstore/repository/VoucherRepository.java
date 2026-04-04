package com.fashionstore.repository;

import com.fashionstore.model.Voucher;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface VoucherRepository extends MongoRepository<Voucher, String> {
    Optional<Voucher> findByCode(String code);
}
