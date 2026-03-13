package com.haiilo.checkout.service;

import com.haiilo.checkout.dto.CheckoutDtos.*;
import com.haiilo.checkout.entity.Item;
import com.haiilo.checkout.entity.SpecialOffer;
import com.haiilo.checkout.exception.DuplicateResourceException;
import com.haiilo.checkout.exception.ResourceNotFoundException;
import com.haiilo.checkout.repository.ItemRepository;
import com.haiilo.checkout.repository.SpecialOfferRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ItemService - CRUD Operations")
class ItemServiceTest {

    @Mock private ItemRepository itemRepository;
    @Mock private SpecialOfferRepository specialOfferRepository;
    @InjectMocks private ItemService itemService;

    private Item apple;

    @BeforeEach
    void setUp() {
        apple = Item.builder()
                .id(1L)
                .name("Apple")
                .unitPrice(new BigDecimal("30"))
                .build();
        SpecialOffer offer = SpecialOffer.builder()
                .id(10L).item(apple)
                .quantityRequired(2).offerPrice(new BigDecimal("45"))
                .build();
        apple.setSpecialOffer(offer);
    }

    @Test
    @DisplayName("findAll returns mapped responses")
    void findAllReturnsMappedItems() {
        when(itemRepository.findAllWithOffers()).thenReturn(List.of(apple));

        List<ItemResponse> result = itemService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Apple");
        assertThat(result.get(0).specialOffer()).isNotNull();
        assertThat(result.get(0).specialOffer().quantityRequired()).isEqualTo(2);
    }

    @Test
    @DisplayName("create throws DuplicateResourceException when name already exists")
    void createThrowsOnDuplicateName() {
        when(itemRepository.existsByNameIgnoreCase("Apple")).thenReturn(true);

        assertThatThrownBy(() -> itemService.create(
                new ItemRequest("Apple", new BigDecimal("30"), null)))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Apple");

        verify(itemRepository, never()).save(any());
    }

    @Test
    @DisplayName("create persists item without offer")
    void createItemWithoutOffer() {
        when(itemRepository.existsByNameIgnoreCase("Peach")).thenReturn(false);
        Item saved = Item.builder().id(5L).name("Peach").unitPrice(new BigDecimal("60")).build();
        when(itemRepository.save(any())).thenReturn(saved);

        ItemResponse result = itemService.create(new ItemRequest("Peach", new BigDecimal("60"), null));

        assertThat(result.name()).isEqualTo("Peach");
        assertThat(result.specialOffer()).isNull();
        verify(itemRepository).save(any());
    }

    @Test
    @DisplayName("delete throws ResourceNotFoundException for unknown id")
    void deleteThrowsForUnknownId() {
        when(itemRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> itemService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(itemRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("findById throws ResourceNotFoundException for unknown id")
    void findByIdThrows() {
        when(itemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> itemService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
