import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../../core/services/item.service';
import { Item } from '../../../../core/models/checkout.models';

@Component({
  selector: 'app-item-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="picker">
      <h3 class="picker__title">Add Items to Basket</h3>

      @if (loading) {
        <div class="picker__loading">Loading items…</div>
      } @else {
        <div class="picker__grid">
          @for (item of items; track item.id) {
            <div class="item-card">
              <div class="item-card__name">{{ item.name }}</div>
              <div class="item-card__price">€{{ item.unitPrice | number: '1.2-2' }}</div>
              @if (item.specialOffer) {
                <div class="item-card__offer">
                  🏷️ {{ item.specialOffer.quantityRequired }} for
                  €{{ item.specialOffer.offerPrice | number: '1.2-2' }}
                </div>
              }
              <div class="item-card__actions">
                <input
                  type="number"
                  class="item-card__qty"
                  [(ngModel)]="quantities[item.id]"
                  min="1"
                  max="99"
                  placeholder="Qty"
                />
                <button
                  class="btn btn--primary btn--sm"
                  (click)="onAdd(item)"
                  [disabled]="!quantities[item.id] || quantities[item.id] < 1"
                >
                  Add
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .picker__title { margin: 0 0 1rem; font-size: 1.1rem; font-weight: 600; color: #1a1a2e; }
    .picker__loading { color: #6b7280; padding: 1rem 0; }

    .picker__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }

    .item-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      transition: box-shadow 0.2s;
    }
    .item-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    .item-card__name { font-weight: 700; font-size: 1rem; color: #111827; }
    .item-card__price { color: #374151; font-size: 0.9rem; }
    .item-card__offer {
      font-size: 0.78rem;
      color: #16a34a;
      font-weight: 600;
      background: #dcfce7;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .item-card__actions { display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.5rem; }

    .item-card__qty {
      width: 52px;
      padding: 0.35rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      text-align: center;
    }
    .item-card__qty:focus { outline: none; border-color: #e94560; }

    .btn { border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn--primary { background: #e94560; color: #fff; }
    .btn--primary:hover:not(:disabled) { opacity: 0.85; }
    .btn--sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
  `],
})
export class ItemPickerComponent implements OnInit {
  readonly itemAdded = output<{ item: Item; quantity: number }>();

  protected items: Item[] = [];
  protected loading = true;
  protected quantities: Record<number, number> = {};

  private readonly itemService = inject(ItemService);

  ngOnInit(): void {
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.items.forEach((i) => (this.quantities[i.id] = 1));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  protected onAdd(item: Item): void {
    const quantity = this.quantities[item.id] ?? 1;
    if (quantity < 1) return;
    this.itemAdded.emit({ item, quantity });
    this.quantities[item.id] = 1;
  }
}
