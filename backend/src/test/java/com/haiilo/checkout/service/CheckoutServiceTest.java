package com.haiilo.checkout.service;

import com.haiilo.checkout.dto.CheckoutDtos.*;
import com.haiilo.checkout.entity.Item;
import com.haiilo.checkout.entity.SpecialOffer;
import com.haiilo.checkout.exception.ResourceNotFoundException;
import com.haiilo.checkout.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CheckoutService - Pricing Engine")
class CheckoutServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private CheckoutService checkoutService;

    private Item apple;
    private Item banana;
    private Item peach;

    @BeforeEach
    void setUp() {
        apple = Item.builder()
                .id(1L).name("Apple").unitPrice(new BigDecimal("30"))
                .build();
        SpecialOffer appleOffer = SpecialOffer.builder()
                .item(apple).quantityRequired(2).offerPrice(new BigDecimal("45"))
                .build();
        apple.setSpecialOffer(appleOffer);

        banana = Item.builder()
                .id(2L).name("Banana").unitPrice(new BigDecimal("50"))
                .build();
        SpecialOffer bananaOffer = SpecialOffer.builder()
                .item(banana).quantityRequired(3).offerPrice(new BigDecimal("130"))
                .build();
        banana.setSpecialOffer(bananaOffer);

        peach = Item.builder()
                .id(3L).name("Peach").unitPrice(new BigDecimal("60"))
                .build();
        // no special offer for peach
    }

    // items with no special offers

    @Test
    @DisplayName("Single item without offer: price = unitPrice * qty")
    void singleItemNoOffer() {
        when(itemRepository.findByNameIgnoreCase("Peach")).thenReturn(Optional.of(peach));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Peach", 2))));

        assertThat(response.totalPrice()).isEqualByComparingTo("120");
        assertThat(response.totalSavings()).isEqualByComparingTo("0");
    }

    //  special offer - exact multiples

    @Test
    @DisplayName("Apple: 2 items → offer price 45 applied")
    void appleExactOfferGroup() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Apple", 2))));

        assertThat(response.totalPrice()).isEqualByComparingTo("45");
        assertThat(response.totalSavings()).isEqualByComparingTo("15"); // saved 60 - 45
    }

    @Test
    @DisplayName("Apple: 4 items → 2 offer groups = 45 * 2 = 90")
    void appleDoubleOfferGroup() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Apple", 4))));

        assertThat(response.totalPrice()).isEqualByComparingTo("90");
        assertThat(response.totalSavings()).isEqualByComparingTo("30");
    }

    // special offer - with remainder 

    @Test
    @DisplayName("Apple: 3 items → 1 offer group (45) + 1 remainder (30) = 75")
    void appleOfferGroupPlusRemainder() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Apple", 3))));

        assertThat(response.totalPrice()).isEqualByComparingTo("75");
        assertThat(response.totalSavings()).isEqualByComparingTo("15");
    }

    @Test
    @DisplayName("Banana: 3 for 130 - exact offer group")
    void bananaExactOfferGroup() {
        when(itemRepository.findByNameIgnoreCase("Banana")).thenReturn(Optional.of(banana));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Banana", 3))));

        assertThat(response.totalPrice()).isEqualByComparingTo("130");
        assertThat(response.totalSavings()).isEqualByComparingTo("20"); // 150 - 130
    }

    @Test
    @DisplayName("Banana: 7 items → 2 offer groups (260) + 1 remainder (50) = 310")
    void bananaMultipleGroupsWithRemainder() {
        when(itemRepository.findByNameIgnoreCase("Banana")).thenReturn(Optional.of(banana));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Banana", 7))));

        assertThat(response.totalPrice()).isEqualByComparingTo("310");
        assertThat(response.totalSavings()).isEqualByComparingTo("40"); // (7*50) - 310 = 350 - 310
    }

    // mixed basket 
    @Test
    @DisplayName("Mixed basket: Apple(1) + Banana(1) + Apple(1) → recognizes 2 apples, applies offer")
    void mixedBasketApplesBanana() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));
        when(itemRepository.findByNameIgnoreCase("Banana")).thenReturn(Optional.of(banana));

        // scanned in mixed order
        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(
                        new ScannedItem("Apple", 2),   // aggregated
                        new ScannedItem("Banana", 1)
                )));

        // apple: 2 for 45 → 45
        // banana: 1 * 50 → 50
        assertThat(response.totalPrice()).isEqualByComparingTo("95");
        assertThat(response.totalSavings()).isEqualByComparingTo("15");
    }

    @Test
    @DisplayName("Full mixed basket with all items")
    void fullMixedBasket() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));
        when(itemRepository.findByNameIgnoreCase("Banana")).thenReturn(Optional.of(banana));
        when(itemRepository.findByNameIgnoreCase("Peach")).thenReturn(Optional.of(peach));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(
                        new ScannedItem("Apple", 3),   // 1 group (45) + 1 rem (30) = 75
                        new ScannedItem("Banana", 6),  // 2 groups (260)
                        new ScannedItem("Peach", 2)    // no offer = 120
                )));

        assertThat(response.totalPrice()).isEqualByComparingTo("455");
        assertThat(response.totalSavings()).isEqualByComparingTo("55"); // 15 (apple) + 40 (banana)
    }

    // edge cases

    @Test
    @DisplayName("Single item, quantity 1, with offer — offer NOT triggered")
    void singleItemBelowOfferThreshold() {
        when(itemRepository.findByNameIgnoreCase("Apple")).thenReturn(Optional.of(apple));

        CheckoutResponse response = checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Apple", 1))));

        assertThat(response.totalPrice()).isEqualByComparingTo("30");
        assertThat(response.totalSavings()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Unknown item throws ResourceNotFoundException")
    void unknownItemThrows() {
        when(itemRepository.findByNameIgnoreCase("Mango")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> checkoutService.calculate(
                new CheckoutRequest(List.of(new ScannedItem("Mango", 1)))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mango");
    }
}
