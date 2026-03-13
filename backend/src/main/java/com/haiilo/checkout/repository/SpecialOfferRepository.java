package com.haiilo.checkout.repository;

import com.haiilo.checkout.entity.SpecialOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialOfferRepository extends JpaRepository<SpecialOffer, Long> {

    Optional<SpecialOffer> findByItemId(Long itemId);

    void deleteByItemId(Long itemId);
}
