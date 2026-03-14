import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemFormComponent } from '../../components/item-form/item-form.component';
import { ItemService } from '../../../../core/services/item.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Item, ItemRequest } from '../../../../core/models/checkout.models';
import { OfferService } from '../../../../core/services/offer.service';

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [CommonModule, ItemFormComponent],
  template: `
    <div class="page">
      <div class="page__header">
        <div>
          <h1 class="page__title">Manage Items</h1>
          <p class="page__subtitle">Add, edit, or remove items and their special offers.</p>
        </div>
        <button class="btn btn--primary" (click)="openCreate()">+ New Item</button>
      </div>

      <!-- Slide-in form panel -->
      @if (showForm()) {
        <div class="form-overlay" (click)="closeForm()">
          <div class="form-panel" (click)="$event.stopPropagation()">
            <app-item-form
              [item]="editingItem()"
              [saving]="saving()"
              (submitted)="onFormSubmit($event)"
              (cancelled)="closeForm()"
            />
          </div>
        </div>
      }

      <!-- Items table -->
      <div class="card">
        @if (loading()) {
          <div class="state-msg">Loading items…</div>
        } @else if (items().length === 0) {
          <div class="state-msg state-msg--empty">
            No items yet. Create your first item using the button above.
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit Price</th>
                  <th>Special Offer</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id) {
                  <tr>
                    <td class="td--name">{{ item.name }}</td>
                    <td>€{{ item.unitPrice | number: '1.2-2' }}</td>
                    <td>
                     @if (item.specialOffer && offerService.offerStatus(item.specialOffer.validUntil, now()) !== 'expired') {
                      <div class="offer-info">
                        <span class="offer-chip">
                          {{ item.specialOffer.quantityRequired }} for
                          €{{ item.specialOffer.offerPrice | number: '1.2-2' }}
                        </span>
                        @if (offerService.offerStatus(item.specialOffer.validUntil, now()) === 'soon') {
                          <span class="offer-expiry offer-expiry--soon">
                            {{ offerService.expiryLabel(item.specialOffer.validUntil, now()) }}
                          </span>
                        } @else {
                          <span class="offer-expiry">
                            {{ offerService.expiryLabel(item.specialOffer.validUntil, now()) }}
                          </span>
                        }
                      </div>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                    </td>
                    <td class="text-muted">{{ item.updatedAt | date: 'dd MMM yyyy, HH:mm' }}</td>
                    <td>
                      <div class="row-actions">
                        <button class="action-btn action-btn--edit" (click)="openEdit(item)">Edit</button>
                        <button
                          class="action-btn action-btn--delete"
                          (click)="onDelete(item)"
                          [disabled]="deletingId() === item.id"
                        >
                          {{ deletingId() === item.id ? '…' : 'Delete' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
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
    .page__subtitle { margin: 0; color: #6b7280; font-size: 0.95rem; }

    .card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    /* Form overlay */
    .form-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .form-panel {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      animation: slideUp 0.25s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* Table */
    .table-wrapper { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .table th {
      text-align: left;
      padding: 0.85rem 1.25rem;
      background: #f9fafb;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
    }
    .table td {
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }
    .table tbody tr:last-child td { border-bottom: none; }
    .table tbody tr:hover td { background: #fafafa; }

    .td--name { font-weight: 600; color: #111827; }
    .text-muted { color: #9ca3af; font-size: 0.85rem; }

    .offer-chip {
      background: #dcfce7;
      color: #15803d;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 99px;
    }

    .offer-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .offer-expiry { font-size: 0.72rem; color: #6b7280; }
    .offer-expiry--soon { color: #f59e0b; font-weight: 600; }
    .offer-expiry--expired { color: #ef4444; font-weight: 600; }

    .row-actions { display: flex; gap: 0.5rem; }
    .action-btn {
      border: none;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.3rem 0.7rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .action-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .action-btn--edit { background: #ede9fe; color: #7c3aed; }
    .action-btn--edit:hover:not(:disabled) { opacity: 0.75; }
    .action-btn--delete { background: #fee2e2; color: #ef4444; }
    .action-btn--delete:hover:not(:disabled) { opacity: 0.75; }

    .state-msg { padding: 3rem; text-align: center; color: #9ca3af; font-size: 0.95rem; }
    .state-msg--empty { color: #6b7280; }

    .btn { border: none; border-radius: 8px; font-weight: 700; cursor: pointer; padding: 0.65rem 1.25rem; font-size: 0.9rem; }
    .btn--primary { background: #e94560; color: #fff; }
    .btn--primary:hover { opacity: 0.85; }
  `],
})
export class ItemsPageComponent implements OnInit, OnDestroy  {
  protected readonly items = signal<Item[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editingItem = signal<Item | null>(null);

  private readonly itemService = inject(ItemService);
  private readonly notification = inject(NotificationService);
  protected readonly offerService = inject(OfferService);
  protected readonly now = signal(Date.now());

  private timerRef: any;
  private reloadRef: any;

   ngOnInit(): void {
    this.loadItems();

    this.timerRef = setInterval(() => {
      this.now.set(Date.now());
    }, 1_000);

   
    this.reloadRef = setInterval(() => {
      this.itemService.getAll().subscribe({
        next: (items) => this.items.set(items), 
      });
    }, 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRef);
    clearInterval(this.reloadRef);
  }

  protected openCreate(): void {
    this.editingItem.set(null);
    this.showForm.set(true);
  }

  protected openEdit(item: Item): void {
    this.editingItem.set(item);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
  }

  protected onFormSubmit(request: ItemRequest): void {
    this.saving.set(true);
    const editing = this.editingItem();
    const operation = editing
      ? this.itemService.update(editing.id, request)
      : this.itemService.create(request);

    operation.subscribe({
      next: () => {
        this.notification.success(editing ? 'Item updated!' : 'Item created!');
        this.closeForm();
        this.loadItems();
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  protected onDelete(item: Item): void {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    this.deletingId.set(item.id);
    this.itemService.delete(item.id).subscribe({
      next: () => {
        this.notification.success(`"${item.name}" deleted.`);
        this.items.update((list) => list.filter((i) => i.id !== item.id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }

  private loadItems(): void {
    this.loading.set(true);
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
