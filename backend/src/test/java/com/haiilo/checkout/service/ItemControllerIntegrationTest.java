package com.haiilo.checkout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.haiilo.checkout.dto.CheckoutDtos.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("Items API - Integration Tests")
class ItemControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/items returns seeded items")
    void getAllReturnsSeededItems() throws Exception {
        mockMvc.perform(get("/api/v1/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].name").value("Apple"));
    }

    @Test
    @DisplayName("POST /api/v1/items creates a new item")
    void createItem() throws Exception {
        ItemRequest req = new ItemRequest("Mango", new BigDecimal("75"), null);

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Mango"))
                .andExpect(jsonPath("$.unitPrice").value(75.0))
                .andExpect(jsonPath("$.specialOffer").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/items → 409 for duplicate name")
    void createDuplicateItemReturns409() throws Exception {
        ItemRequest req = new ItemRequest("Apple", new BigDecimal("30"), null);

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/v1/items → 400 for missing name")
    void createWithMissingNameReturns400() throws Exception {
        String body = "{\"unitPrice\": 30}";

        mockMvc.perform(post("/api/v1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/items/{id} → 204 then 404")
    void deleteItem() throws Exception {
        // ensure if apple exists (id=1 from seed)
        mockMvc.perform(get("/api/v1/items/1"))
                .andExpect(status().isOk());

        // delete 
        mockMvc.perform(delete("/api/v1/items/1"))
                .andExpect(status().isNoContent());

        // verify it is gone
        mockMvc.perform(get("/api/v1/items/1"))
                .andExpect(status().isNotFound());
    }
}
