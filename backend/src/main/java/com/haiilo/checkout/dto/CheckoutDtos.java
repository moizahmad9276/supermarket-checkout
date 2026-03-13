package com.haiilo.checkout.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class CheckoutDtos {

    private CheckoutDtos() {}

    // item dtos
    public record SpecialOfferRequest(
        @NotNull @Min(2) Integer quantityRequired,
        @NotNull @DecimalMin("0.01") BigDecimal offerPrice
    ) {}

    public record ItemRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull @DecimalMin("0.01") BigDecimal unitPrice,
        SpecialOfferRequest specialOffer
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SpecialOfferResponse(
        Long id,
        Integer quantityRequired,
        BigDecimal offerPrice
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ItemResponse(
        Long id,
        String name,
        BigDecimal unitPrice,
        SpecialOfferResponse specialOffer,
        Instant createdAt,
        Instant updatedAt
    ) {}

    //checkout dtos

    /** for single scan item*/
    public record ScannedItem(
        @NotBlank String name,
        @NotNull @Min(1) Integer quantity
    ) {}

    /** list of items to checkout */
    public record CheckoutRequest(
        @NotEmpty List<ScannedItem> items
    ) {}

    /** per item breakdown in recipt */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ReceiptLineItem(
        String name,
        Integer quantity,
        BigDecimal unitPrice,
        Integer offerGroupsApplied,
        BigDecimal savings,
        BigDecimal subtotal
    ) {}

    /** full receipt after checkout */
    public record CheckoutResponse(
        List<ReceiptLineItem> lineItems,
        BigDecimal totalWithoutOffers,
        BigDecimal totalSavings,
        BigDecimal totalPrice
    ) {}
}
