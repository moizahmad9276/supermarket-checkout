import { Component, OnInit, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Item, ItemRequest } from '../../../../core/models/checkout.models';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="item-form" novalidate>
      <h3 class="form__title">{{ item() ? 'Edit Item' : 'New Item' }}</h3>

      <div class="form-group">
        <label class="form-label" for="name">Name</label>
        <input
          id="name"
          class="form-control"
          [class.form-control--error]="nameInvalid"
          formControlName="name"
          placeholder="e.g. Apple"
        />
        @if (nameInvalid) {
          <span class="form-error">Name is required (max 100 characters)</span>
        }
      </div>

      <div class="form-group">
        <label class="form-label" for="unitPrice">Unit Price (€)</label>
        <input
          id="unitPrice"
          class="form-control"
          [class.form-control--error]="priceInvalid"
          formControlName="unitPrice"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="e.g. 30"
        />
        @if (priceInvalid) {
          <span class="form-error">Price must be greater than 0</span>
        }
      </div>

      <div class="form-group">
        <label class="form-label checkbox-label">
          <input type="checkbox" formControlName="hasOffer" (change)="onOfferToggle()" />
          Special offer
        </label>
      </div>

      @if (form.value.hasOffer) {
        <div class="offer-group" formGroupName="specialOffer">
          <div class="form-group">
            <label class="form-label" for="qty">Quantity required</label>
            <input
              id="qty"
              class="form-control"
              formControlName="quantityRequired"
              type="number"
              min="2"
              placeholder="e.g. 2"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="offerPrice">Offer price (€)</label>
            <input
              id="offerPrice"
              class="form-control"
              formControlName="offerPrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 45"
            />
          </div>
        </div>
      }

      <div class="form-actions">
        <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving…' : (item() ? 'Update' : 'Create') }}
        </button>
        <button type="button" class="btn btn--ghost" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .form__title { margin: 0 0 1.25rem; font-size: 1.1rem; font-weight: 700; color: #1a1a2e; }

    .form-group { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
    .form-label { font-size: 0.85rem; font-weight: 600; color: #374151; }

    .form-control {
      padding: 0.6rem 0.85rem;
      border: 1.5px solid #d1d5db;
      border-radius: 7px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .form-control:focus { outline: none; border-color: #e94560; }
    .form-control--error { border-color: #ef4444; }

    .form-error { font-size: 0.78rem; color: #ef4444; }

    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

    .offer-group {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .offer-group .form-group:last-child { margin-bottom: 0; }

    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }

    .btn { border: none; border-radius: 7px; font-weight: 700; cursor: pointer; padding: 0.65rem 1.25rem; font-size: 0.9rem; }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn--primary { background: #e94560; color: #fff; }
    .btn--primary:hover:not(:disabled) { opacity: 0.85; }
    .btn--ghost { background: transparent; color: #6b7280; border: 1px solid #e5e7eb; }
    .btn--ghost:hover { border-color: #9ca3af; }
  `],
})
export class ItemFormComponent implements OnInit {
  readonly item = input<Item | null>(null);
  readonly saving = input(false);
  readonly submitted = output<ItemRequest>();
  readonly cancelled = output<void>();

  protected form!: FormGroup;
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    const existing = this.item();
    this.form = this.fb.group({
      name: [existing?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      unitPrice: [existing?.unitPrice ?? null, [Validators.required, Validators.min(0.01)]],
      hasOffer: [!!existing?.specialOffer],
      specialOffer: this.fb.group({
        quantityRequired: [existing?.specialOffer?.quantityRequired ?? 2, [Validators.min(2)]],
        offerPrice: [existing?.specialOffer?.offerPrice ?? null, [Validators.min(0.01)]],
      }),
    });
  }

  protected onOfferToggle(): void {
    const offerGroup = this.form.get('specialOffer')!;
    if (this.form.value.hasOffer) {
      offerGroup.get('quantityRequired')!.setValidators([Validators.required, Validators.min(2)]);
      offerGroup.get('offerPrice')!.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      offerGroup.get('quantityRequired')!.clearValidators();
      offerGroup.get('offerPrice')!.clearValidators();
    }
    offerGroup.get('quantityRequired')!.updateValueAndValidity();
    offerGroup.get('offerPrice')!.updateValueAndValidity();
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

    const { name, unitPrice, hasOffer, specialOffer } = this.form.value;
    const request: ItemRequest = {
      name,
      unitPrice,
      specialOffer: hasOffer ? specialOffer : null,
    };
    this.submitted.emit(request);
  }

  protected get nameInvalid(): boolean {
    const c = this.form.get('name')!;
    return c.invalid && c.touched;
  }

  protected get priceInvalid(): boolean {
    const c = this.form.get('unitPrice')!;
    return c.invalid && c.touched;
  }
}
