package com.haiilo.checkout.service;

import com.haiilo.checkout.dto.CheckoutDtos.*;
import com.haiilo.checkout.entity.Item;
import com.haiilo.checkout.entity.SpecialOffer;
import com.haiilo.checkout.exception.ResourceNotFoundException;
import com.haiilo.checkout.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheckoutService {

    private final ItemRepository itemRepository;

    public CheckoutResponse calculate(CheckoutRequest request) {
        List<ReceiptLineItem> lineItems = new ArrayList<>();
        BigDecimal totalWithoutOffers = BigDecimal.ZERO;
        BigDecimal totalSavings = BigDecimal.ZERO;

        for (ScannedItem scanned : request.items()) {
            Item item = itemRepository.findByNameIgnoreCase(scanned.name())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Unknown item: '%s'. Please check the item name.".formatted(scanned.name())));

            int qty = scanned.quantity();
            BigDecimal unitPrice = item.getUnitPrice();
            BigDecimal fullPrice = unitPrice.multiply(BigDecimal.valueOf(qty));
            totalWithoutOffers = totalWithoutOffers.add(fullPrice);

            SpecialOffer offer = item.getSpecialOffer();
            if (offer != null && offer.getValidUntil() != null
                    && offer.getValidUntil().isBefore(Instant.now())) {
                offer = null; 
            }
            
            BigDecimal subtotal;
            int offerGroupsApplied = 0;
            BigDecimal savings = BigDecimal.ZERO;

            if (offer != null) {
                int n = offer.getQuantityRequired();
                BigDecimal offerPrice = offer.getOfferPrice();

                offerGroupsApplied = qty / n;
                int remainder = qty % n;

                BigDecimal offerCost = offerPrice.multiply(BigDecimal.valueOf(offerGroupsApplied));
                BigDecimal remainderCost = unitPrice.multiply(BigDecimal.valueOf(remainder));
                subtotal = offerCost.add(remainderCost);
                savings = fullPrice.subtract(subtotal);
            } else {
                subtotal = fullPrice;
            }

            totalSavings = totalSavings.add(savings);

            lineItems.add(new ReceiptLineItem(
                    item.getName(),
                    qty,
                    unitPrice,
                    offerGroupsApplied > 0 ? offerGroupsApplied : null,
                    savings.compareTo(BigDecimal.ZERO) > 0 ? savings : null,
                    subtotal
            ));
        }

        BigDecimal totalPrice = totalWithoutOffers.subtract(totalSavings);

        System.out.println("Checkout calculated: items=" + lineItems.size() + " total=" + totalPrice + " savings=" + totalSavings);

        return new CheckoutResponse(lineItems, totalWithoutOffers, totalSavings, totalPrice);
    }
}
