import { Injectable, computed, signal } from '@angular/core';
import { BasketEntry, Item } from '../models/checkout.models';


 //aggregates quantities automatically when the same item is added multiple times
 
@Injectable({ providedIn: 'root' })
export class BasketService {
  private readonly _entries = signal<BasketEntry[]>([]);

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
}
