package com.haiilo.checkout.repository;

import com.haiilo.checkout.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT i FROM Item i LEFT JOIN FETCH i.specialOffer ORDER BY i.name")
    List<Item> findAllWithOffers();
}
