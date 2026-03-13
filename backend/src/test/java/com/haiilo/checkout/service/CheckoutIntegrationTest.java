package com.haiilo.checkout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.haiilo.checkout.dto.CheckoutDtos.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Checkout API - Integration Tests")
class CheckoutIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/v1/checkout → correct totals with seeded data")
    void checkoutWithSeededItems() throws Exception {
        CheckoutRequest request = new CheckoutRequest(List.of(
                new ScannedItem("Apple", 2),
                new ScannedItem("Banana", 3)
        ));

        MvcResult result = mockMvc.perform(post("/api/v1/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPrice").value(175.0))   // apple: 45 + banana: 130
                .andExpect(jsonPath("$.totalSavings").value(35.0))  // 15 + 20
                .andReturn();
    }

    @Test
    @DisplayName("POST /api/v1/checkout → 404 for unknown item")
    void checkoutUnknownItem() throws Exception {
        CheckoutRequest request = new CheckoutRequest(List.of(new ScannedItem("Mango", 1)));

        mockMvc.perform(post("/api/v1/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/checkout → 400 for empty basket")
    void checkoutEmptyBasket() throws Exception {
        CheckoutRequest request = new CheckoutRequest(List.of());

        mockMvc.perform(post("/api/v1/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
