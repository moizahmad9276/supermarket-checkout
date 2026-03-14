package com.haiilo.checkout.service;

import com.haiilo.checkout.dto.CheckoutDtos.*;
import com.haiilo.checkout.entity.Item;
import com.haiilo.checkout.entity.SpecialOffer;
import com.haiilo.checkout.exception.DuplicateResourceException;
import com.haiilo.checkout.exception.ResourceNotFoundException;
import com.haiilo.checkout.repository.ItemRepository;
import com.haiilo.checkout.repository.SpecialOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final SpecialOfferRepository specialOfferRepository;

    public List<ItemResponse> findAll() {
        return itemRepository.findAllWithOffers().stream()
                .map(this::toResponse)
                .toList();
    }

    public ItemResponse findById(Long id) {
        return toResponse(fetchItem(id));
    }

    @Transactional
    public ItemResponse create(ItemRequest request) {
        if (itemRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Item with name '%s' already exists".formatted(request.name()));
        }

        Item item = Item.builder()
                .name(request.name().trim())
                .unitPrice(request.unitPrice())
                .build();

        if (request.specialOffer() != null) {
            SpecialOffer offer = buildOffer(request.specialOffer(), item);
            item.setSpecialOffer(offer);
        }

        Item saved = itemRepository.save(item);
        System.out.println("Created item id=" + saved.getId() + " name=" + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public ItemResponse update(Long id, ItemRequest request) {
        Item item = fetchItem(id);

        // check name uniqueness only if the name is actually changing
        if (!item.getName().equalsIgnoreCase(request.name()) &&
            itemRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Item with name '%s' already exists".formatted(request.name()));
        }

        item.setName(request.name().trim());
        item.setUnitPrice(request.unitPrice());

        // replace or remove special offer
        if (request.specialOffer() != null) {
            if (item.getSpecialOffer() != null) {
                item.getSpecialOffer().setQuantityRequired(request.specialOffer().quantityRequired());
                item.getSpecialOffer().setOfferPrice(request.specialOffer().offerPrice());
            } else {
                item.setSpecialOffer(buildOffer(request.specialOffer(), item));
            }
        } else {
            if (item.getSpecialOffer() != null) {
                specialOfferRepository.deleteByItemId(id);
                item.setSpecialOffer(null);
            }
        }

        Item saved = itemRepository.save(item);
        System.out.println("Updated item id=" + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
        System.out.println("Deleted item id=" + id);
    }

    private Item fetchItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
    }

    private SpecialOffer buildOffer(SpecialOfferRequest req, Item item) {
        return SpecialOffer.builder()
                .item(item)
                .quantityRequired(req.quantityRequired())
                .offerPrice(req.offerPrice())
                .build();
    }

    public ItemResponse toResponse(Item item) {
        SpecialOfferResponse offerResponse = null;
        if (item.getSpecialOffer() != null) {
            SpecialOffer o = item.getSpecialOffer();
            offerResponse = new SpecialOfferResponse(o.getId(), o.getQuantityRequired(), o.getOfferPrice());
        }
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getUnitPrice(),
                offerResponse,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
