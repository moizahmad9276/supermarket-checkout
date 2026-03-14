import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReceiptHistoryService, ReceiptRecord } from '../../../../core/services/receipt-history.service';
import { ReceiptPanelComponent } from '../../../checkout/components/receipt-panel/receipt-panel.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, DatePipe, ReceiptPanelComponent],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Order History</h1>
          <p class="page__subtitle">
            Receipts from this session ({{ history.history().length }} order{{ history.history().length === 1 ? '' : 's' }}).
            History is cleared when you close the browser tab.
          </p>
        </div>
        @if (history.history().length > 0) {
          <button class="btn btn--danger" (click)="onClear()">🗑 Clear History</button>
        }
      </div>

      @if (history.history().length === 0) {
        <div class="empty-state">
          <span class="empty-state__icon">🧾</span>
          <h3>No orders yet</h3>
          <p>Complete a checkout and your receipts will appear here.</p>
        </div>
      } @else {
        <div class="history-layout">
          <!-- Sidebar: order list -->
          <div class="order-list">
            @for (record of history.history(); track record.id) {
              <div
                class="order-card"
                [class.order-card--active]="selectedId() === record.id"
                (click)="select(record)"
              >
                <div class="order-card__top">
                  <span class="order-card__num">#{{ history.history().indexOf(record) + 1 }}</span>
                  <span class="order-card__total">€{{ record.receipt.totalPrice | number: '1.2-2' }}</span>
                </div>
                <div class="order-card__time">{{ record.timestamp | date: 'dd MMM yyyy, HH:mm:ss' }}</div>
                <div class="order-card__items">
                  {{ totalItems(record) }} item{{ totalItems(record) === 1 ? '' : 's' }}
                  @if (record.receipt.totalSavings > 0) {
                    · <span class="order-card__savings">saved €{{ record.receipt.totalSavings | number: '1.2-2' }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Detail: selected receipt -->
          <div class="order-detail">
            @if (selected()) {
              <app-receipt-panel
                [receipt]="selected()!.receipt"
                [record]="selected()"
              />
            } @else {
              <div class="detail-placeholder">
                <span>👈</span>
                <p>Select an order to view the receipt.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .page__title { margin: 0 0 0.25rem; font-size: 1.75rem; font-weight: 800; color: #1a1a2e; }
    .page__subtitle { margin: 0; color: #6b7280; font-size: 0.875rem; max-width: 480px; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      text-align: center;
      color: #9ca3af;
      gap: 0.5rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
    }
    .empty-state__icon { font-size: 3rem; }
    .empty-state h3 { margin: 0; font-size: 1.1rem; color: #374151; }
    .empty-state p { margin: 0; font-size: 0.9rem; }

    .history-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .history-layout { grid-template-columns: 1fr; }
    }

    .order-list { display: flex; flex-direction: column; gap: 0.5rem; }

    .order-card {
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      padding: 0.875rem 1rem;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .order-card:hover { border-color: #a5b4fc; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .order-card--active { border-color: #e94560; background: #fff5f6; }

    .order-card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .order-card__num { font-weight: 700; color: #1a1a2e; font-size: 0.9rem; }
    .order-card__total { font-weight: 800; color: #e94560; font-size: 1rem; }
    .order-card__time { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.2rem; }
    .order-card__items { font-size: 0.8rem; color: #6b7280; }
    .order-card__savings { color: #16a34a; font-weight: 600; }

    .detail-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      color: #9ca3af;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 2rem;
      gap: 0.5rem;
    }
    .detail-placeholder p { font-size: 0.9rem; margin: 0; }

    .btn--danger {
      border: none;
      border-radius: 8px;
      background: #fee2e2;
      color: #ef4444;
      font-weight: 700;
      font-size: 0.875rem;
      padding: 0.6rem 1rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn--danger:hover { background: #fecaca; }
  `],
})
export class HistoryPageComponent {
  protected readonly history = inject(ReceiptHistoryService);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selected = signal<ReceiptRecord | null>(null);

  protected select(record: ReceiptRecord): void {
    this.selectedId.set(record.id);
    this.selected.set(record);
  }

  protected totalItems(record: ReceiptRecord): number {
  return record.receipt.lineItems.reduce((sum, line) => sum + line.quantity, 0);
}

  protected onClear(): void {
    if (confirm('Clear all order history for this session?')) {
      this.history.clear();
      this.selectedId.set(null);
      this.selected.set(null);
    }
  }
}