import { Injectable, computed, signal, OnDestroy } from '@angular/core';
import { BasketEntry, Item } from '../models/checkout.models';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private readonly _entries = signal<BasketEntry[]>([]);
  readonly now = signal(Date.now());
  private timerRef: any;

  constructor() {
    this.timerRef = setInterval(() => {
      this.now.set(Date.now());
    }, 1_000);
  }

  readonly entries = this._entries.asReadonly();

  readonly totalItems = computed(() =>
    this._entries().reduce((sum, e) => sum + e.quantity, 0)
  );

  readonly isEmpty = computed(() => this._entries().length === 0);

  addItem(item: Item, quantity = 1): void {
    this._entries.update((entries) => {
      const existing = entries.find((e) => e.item.id === item.id);
      if (existing) {
        return entries.map((e) =>
          e.item.id === item.id ? { ...e, quantity: e.quantity + quantity } : e
        );
      }
      return [...entries, { item, quantity }];
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this._entries.update((entries) =>
      entries.map((e) => (e.item.id === itemId ? { ...e, quantity } : e))
    );
  }

  removeItem(itemId: number): void {
    this._entries.update((entries) => entries.filter((e) => e.item.id !== itemId));
  }

  clear(): void {
    this._entries.set([]);
  }

  refreshItems(updatedItems: Item[]): void {
    this._entries.update((entries) =>
      entries.map((entry) => {
        const updated = updatedItems.find((i) => i.id === entry.item.id);
        return updated ? { ...entry, item: updated } : entry;
      })
    );
  }

  isOfferActive(item: Item): boolean {
    const offer = item.specialOffer;
    return !!(offer && (!offer.validUntil
      || new Date(offer.validUntil).getTime() > this.now()));
  }

  calculateTotal(entries: BasketEntry[]): number {
    return entries.reduce((sum, e) => {
      if (this.isOfferActive(e.item)) {
        const offer = e.item.specialOffer!;
        const groups = Math.floor(e.quantity / offer.quantityRequired);
        const remainder = e.quantity % offer.quantityRequired;
        return sum + (groups * offer.offerPrice) + (remainder * e.item.unitPrice);
      }
      return sum + e.item.unitPrice * e.quantity;
    }, 0);
  }
}