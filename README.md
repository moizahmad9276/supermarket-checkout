# Supermarket Checkout

A full-stack supermarket checkout system (Haiilo)
Calculates the total price of scanned items and applies weekly special offers (e.g. "2 Apples for €45").


## Tech Stack

| Layer     | Technology                                           |
|-----------|------------------------------------------------------|
| Backend   | Java 21, Spring Boot 3.2, Spring Data JPA, Hibernate |
| Database  | PostgreSQL 16, Liquibase (migrations + seeding)      |
| Frontend  | Angular 17 (Standalone API), TypeScript              |
| State     | Angular Signals                                      |
| Tests     | JUnit 5, Mockito, Spring MockMvc, H2 (in-memory)     |
| Dev Tools | Docker, Docker Compose, Postman                      |


## Features

### Checkout
- Scan multiple items in any order — quantities aggregated automatically
- Special offers applied automatically (e.g. "2 for 45", "3 for €130")
- Order confirmation dialog before payment showing itemised list and total
- Full receipt with per-line savings breakdown
- Download receipt as PDF
- Live basket total updates every second including offer expiry awareness

### Special Offers
- Each item can have a "N for X price" weekly offer
- Offers have a `valid_until` expiry — automatically set to 7 days on create or update
- Expired offers ignored at checkout — full price charged automatically
- Live expiry countdown on screen
- Offer tags disappear automatically when expired
- Updating an offer resets the 7-day clock

### Item Management
- Full CRUD — create, edit, delete items and their offers
- Items table with live offer expiry countdown
- Colour coded status: normal → amber (expiring within 24h) → hidden (expired)

### Order History
- All receipts from the current session stored automatically
- Browse past orders with timestamps and totals
- Download any past receipt as PDF
- History cleared when browser tab is closed (sessionStorage)

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+ / npm 10+
- Docker Desktop (must be running)

---

### 1. Start the Database
```bash
cd supermarket-checkout
docker compose up -d postgres
```

Create the database (first time only):
```bash
docker exec -it supermarket-postgres psql -U postgres -c "CREATE DATABASE supermarket_checkout;"
```

> If you get "already exists" that is fine — continue.


### 2. Start the Backend
```bash
cd backend
mvn spring-boot:run
```

Liquibase runs automatically on startup and:
- Creates `items` table
- Creates `special_offers` table 
- Seeds Apple, Banana, Peach, Kiwi with prices and offers valid for 7 days


### 3. Start the Frontend

Open a second terminal:
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:4200**


## Default Pricing (Seeded Data)

| Item   | Unit Price | Special Offer | Offer Expires  |
|--------|------------|---------------|----------------|
| Apple  | €0.30      | 2 for €45.00  | 7 days from now |
| Banana | €0.50      | 3 for €130.00 | 7 days from now |
| Peach  | €0.60      | —             | —              |
| Kiwi   | €0.20      | —             | —              |


## API Reference

Base URL: `http://localhost:8080/api/v1`

### Items

| Method | Endpoint       | Description   |
|--------|----------------|---------------|
| GET    | /items         | List all      |
| GET    | /items/{id}    | Get one       |
| POST   | /items         | Create        |
| PUT    | /items/{id}    | Update        |
| DELETE | /items/{id}    | Delete        |

**Request body:**
```json
{
  "name": "Apple",
  "unitPrice": 30,
  "specialOffer": {
    "quantityRequired": 2,
    "offerPrice": 45
  }
}
```

### Checkout

| Method | Endpoint   | Description            |
|--------|------------|------------------------|
| POST   | /checkout  | Calculate basket total |

**Request:**
```json
{
  "items": [
    { "name": "Apple",  "quantity": 3 },
    { "name": "Banana", "quantity": 3 }
  ]
}
```

**Response:**
```json
{
  "lineItems": [
    {
      "name": "Apple",
      "quantity": 3,
      "unitPrice": 30,
      "offerGroupsApplied": 1,
      "savings": 15,
      "subtotal": 75
    },
    {
      "name": "Banana",
      "quantity": 3,
      "unitPrice": 50,
      "offerGroupsApplied": 1,
      "savings": 20,
      "subtotal": 130
    }
  ],
  "totalWithoutOffers": 240,
  "totalSavings": 35,
  "totalPrice": 205
}
```

## Pricing Algorithm
```
For each item with offer "N for P":
  offerGroups = quantity / N       (integer division)
  remainder   = quantity % N
  subtotal    = (offerGroups × P) + (remainder × unitPrice)
  savings     = (quantity × unitPrice) − subtotal

If offer is expired (validUntil < now):
  subtotal    = quantity × unitPrice   (full price, no discount)
```

---

## Weekly Offers Design

Offers are managed via the UI or API. When created or updated, `valid_until` is automatically
set to **7 days from now**. After expiry:

- Offer tag disappears from the UI immediately
- Checkout engine ignores the expired offer and charges full price
- Basket total and confirm popup recalculate automatically

**To extend to a rather automated system:**
- Needs to add a `@Scheduled` job running (e.g. every Monday) to renew offers
- Send email/Slack notifications to staff when offers are about to expire


## Running Tests
```bash
cd backend
mvn test
```

| Test Class                       | Type        | Covers                                          |
|----------------------------------|-------------|-------------------------------------------------|
| `CheckoutServiceTest`            | Unit        | Pricing algorithm, offers, remainders, mixed basket |
| `ItemServiceTest`                | Unit        | CRUD, duplicate detection, not-found handling   |
| `CheckoutIntegrationTest`        | Integration | POST /checkout — totals, 404, 400 validation    |
| `ItemControllerIntegrationTest`  | Integration | GET/POST/DELETE /items — full HTTP layer        |


## Postman Collection

Import `Supermarket-Checkout.postman_collection.json` into Postman for pre-built
requests covering all endpoints and edge cases (404 unknown item, 400 empty basket, etc).


## Key Design Decisions

- **Prices in cents (integer)** on the backend — avoids floating point rounding errors
- **Basket aggregation** — scanning Apple, Banana, Apple = 2 Apples + 1 Banana automatically
- **Offer expiry is client-side reactive** — Angular Signals + 1-second clock means no page refresh needed
- **Session history** — uses `sessionStorage`, cleared when tab closes, no login required
- **Server polling every 30 seconds** — frontend picks up offer changes made by other users automatically