import { Component, inject, computed  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BasketService } from '../../../../core/services/basket.service';

@Component({
  selector: 'app-basket-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="basket">
      <div class="basket__header">
        <h3 class="basket__title">🛒 Basket</h3>
        @if (!basket.isEmpty()) {
          <button class="btn btn--ghost btn--sm" (click)="basket.clear()">Clear all</button>
        }
      </div>

      @if (basket.isEmpty()) {
        <div class="basket__empty">
          <span class="basket__empty-icon">🛒</span>
          <p>Your basket is empty.<br />Add items from the picker above.</p>
        </div>
      } @else {
        <div class="basket__items">
          @for (entry of basket.entries(); track entry.item.id) {
            <div class="basket-row">
              <div class="basket-row__info">
                <span class="basket-row__name">{{ entry.item.name }}</span>
                <span class="basket-row__unit">€{{ entry.item.unitPrice | number: '1.2-2' }} each</span>
              </div>
              <div class="basket-row__controls">
                <button class="qty-btn" (click)="decrement(entry.item.id, entry.quantity)">−</button>
                <input
                  class="qty-input"
                  type="number"
                  [ngModel]="entry.quantity"
                  (ngModelChange)="basket.updateQuantity(entry.item.id, $event)"
                  min="1"
                  max="99"
                />
                <button class="qty-btn" (click)="basket.updateQuantity(entry.item.id, entry.quantity + 1)">+</button>
                <button class="remove-btn" (click)="basket.removeItem(entry.item.id)" title="Remove">✕</button>
              </div>
            </div>
          }
        </div>

        <div class="basket__summary">
  <div class="summary-row">
    <span>{{ basket.totalItems() }} item{{ basket.totalItems() === 1 ? '' : 's' }}</span>
    <span class="summary-estimate">Total: <strong>€{{ estimatedTotal() | number: '1.2-2' }}</strong></span>
  </div>
</div>
      }
    </div>
  `,
  styles: [`
    .basket { display: flex; flex-direction: column; height: 100%; }

    .basket__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .basket__title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #1a1a2e; }

    .basket__empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      text-align: center;
      padding: 2rem 0;
      gap: 0.5rem;
    }
    .basket__empty-icon { font-size: 2.5rem; }
    .basket__empty p { margin: 0; line-height: 1.6; font-size: 0.9rem; }

    .basket__items { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }

    .basket-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.75rem;
      background: #f9fafb;
      border-radius: 8px;
      gap: 0.5rem;
    }
    .basket-row__info { display: flex; flex-direction: column; min-width: 0; }
    .basket-row__name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .basket-row__unit { font-size: 0.75rem; color: #6b7280; }

    .basket-row__controls { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; }

    .qty-btn {
      width: 26px; height: 26px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:hover { background: #f3f4f6; }

    .qty-input {
      width: 40px;
      text-align: center;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.85rem;
    }
    .qty-input:focus { outline: none; border-color: #e94560; }

    .remove-btn {
      width: 26px; height: 26px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #ef4444;
      cursor: pointer;
      font-size: 0.75rem;
      margin-left: 2px;
    }
    .remove-btn:hover { background: #fee2e2; }

    .basket__summary {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.85rem;
      color: #6b7280;
      text-align: right;
    }

    .btn { border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn--ghost { background: transparent; color: #6b7280; }
    .btn--ghost:hover { color: #ef4444; background: #fee2e2; }
    .btn--sm { padding: 0.3rem 0.6rem; font-size: 0.78rem; }

    .summary-row { display: flex; justify-content: space-between; align-items: center; }
.summary-estimate { font-size: 0.9rem; color: #374151; }
.summary-estimate strong { color: #1a1a2e; font-size: 1rem; }
  `],
})
export class BasketPanelComponent {
  protected readonly basket = inject(BasketService);

protected readonly estimatedTotal = computed(() =>
  this.basket.calculateTotal(this.basket.entries())
);

protected decrement(itemId: number, current: number): void {
    this.basket.updateQuantity(itemId, current - 1);
  }
}
