
// item models

export interface SpecialOffer {
  id: number;
  quantityRequired: number;
  offerPrice: number;
}

export interface Item {
  id: number;
  name: string;
  unitPrice: number;
  specialOffer?: SpecialOffer;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialOfferRequest {
  quantityRequired: number;
  offerPrice: number;
}

export interface ItemRequest {
  name: string;
  unitPrice: number;
  specialOffer?: SpecialOfferRequest | null;
}

// checkout models

export interface ScannedItem {
  name: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: ScannedItem[];
}

export interface ReceiptLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  offerGroupsApplied?: number;
  savings?: number;
  subtotal: number;
}

export interface CheckoutResponse {
  lineItems: ReceiptLineItem[];
  totalWithoutOffers: number;
  totalSavings: number;
  totalPrice: number;
}

export interface BasketEntry {
  item: Item;
  quantity: number;
}
