import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPickerComponent } from '../../components/item-picker/item-picker.component';
import { BasketPanelComponent } from '../../components/basket-panel/basket-panel.component';
import { ReceiptPanelComponent } from '../../components/receipt-panel/receipt-panel.component';
import { BasketService } from '../../../../core/services/basket.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CheckoutResponse, Item } from '../../../../core/models/checkout.models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ItemPickerComponent, BasketPanelComponent, ReceiptPanelComponent],
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Checkout</h1>
        <p class="page__subtitle">Select items and quantities, then press Checkout to calculate your total.</p>
      </div>

      <!-- Item picker -->
      <section class="card">
        <app-item-picker (itemAdded)="onItemAdded($event)" />
      </section>

      <!-- Basket + Receipt -->
      <div class="checkout-layout">
        <section class="card checkout-layout__basket">
          <app-basket-panel />
          <div class="checkout-actions">
            <button
  class="btn btn--checkout"
  [disabled]="basket.isEmpty() || calculating()"
  (click)="onCheckout()"
>
  @if (calculating()) {
    <span class="spinner"></span> Processing payment…
  } @else {
    💳 Pay now
  }
</button>
            @if (receipt()) {
              <button class="btn btn--ghost" (click)="onNewOrder()">New Order</button>
            }
          </div>
        </section>

        <section class="card checkout-layout__receipt">
          <app-receipt-panel [receipt]="receipt()" />
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page__header { margin-bottom: 1.5rem; }
    .page__title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 800; color: #1a1a2e; }
    .page__subtitle { margin: 0; color: #6b7280; font-size: 0.95rem; }

    .card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;
      margin-bottom: 0;
    }
    .checkout-layout .card { margin-bottom: 0; }

    @media (max-width: 768px) {
      .checkout-layout { grid-template-columns: 1fr; }
    }

    .checkout-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
    }

    .btn {
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, background 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn--checkout {
      flex: 1;
      justify-content: center;
      padding: 0.85rem 1.5rem;
      background: #1a1a2e;
      color: #fff;
      font-size: 1rem;
    }
    .btn--checkout:hover:not(:disabled) { background: #e94560; }
    .btn--checkout:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn--ghost {
      padding: 0.85rem 1rem;
      background: transparent;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      font-size: 0.9rem;
    }
    .btn--ghost:hover { border-color: #9ca3af; color: #374151; }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class CheckoutPageComponent {
  protected readonly basket = inject(BasketService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly notification = inject(NotificationService);

  protected readonly calculating = signal(false);
  protected readonly receipt = signal<CheckoutResponse | null>(null);

  protected onItemAdded(event: { item: Item; quantity: number }): void {
    this.basket.addItem(event.item, event.quantity);
    this.receipt.set(null); // resetss receipt when basket chhanges
  }

  protected onCheckout(): void {
  if (this.basket.isEmpty()) return;

  const itemCount = this.basket.totalItems();
  const confirmed = confirm(
    `Confirm your order?\n\n` +
    this.basket.entries().map(e => `  • ${e.item.name} x${e.quantity}`).join('\n') +
    `\n\nTotal items: ${itemCount}`
  );

  if (!confirmed) return;

  this.calculating.set(true);

  const items = this.basket.entries().map((e) => ({
    name: e.item.name,
    quantity: e.quantity,
  }));

  this.checkoutService.calculate({ items }).subscribe({
    next: (response) => {
      this.receipt.set(response);
      this.basket.clear();
      this.calculating.set(false);
      this.notification.success('✅ Payment successful! Thank you for your order.');
    },
    error: () => {
      this.calculating.set(false);
    },
  });
}

  protected onNewOrder(): void {
    this.basket.clear();
    this.receipt.set(null);
  }
}
