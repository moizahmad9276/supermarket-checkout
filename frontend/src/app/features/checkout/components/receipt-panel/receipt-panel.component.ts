import { Component, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckoutResponse } from '../../../../core/models/checkout.models';
import { ReceiptRecord } from '../../../../core/services/receipt-history.service';

@Component({
  selector: 'app-receipt-panel',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    @if (receipt(); as r) {
      <div class="receipt">
        <div class="receipt__header">
          <div class="receipt__header-left">
            <h3 class="receipt__title">🧾 Receipt</h3>
            @if (record()) {
              <span class="receipt__time">{{ record()!.timestamp | date: 'dd MMM yyyy, HH:mm' }}</span>
            }
          </div>
          <div class="receipt__header-right">
            <button class="btn btn--pdf" (click)="downloadPdf(r)" title="Download PDF">
              ⬇ PDF
            </button>
          </div>
        </div>

        <div class="receipt__lines">
          @for (line of r.lineItems; track line.name) {
            <div class="receipt-line">
              <div class="receipt-line__left">
                <span class="receipt-line__name">{{ line.name }}</span>
                <span class="receipt-line__detail">
                  {{ line.quantity }} × €{{ line.unitPrice | number: '1.2-2' }}
                  @if (line.offerGroupsApplied) {
                    <span class="receipt-line__offer-badge">
                      {{ line.offerGroupsApplied }} offer{{ line.offerGroupsApplied > 1 ? 's' : '' }} applied
                    </span>
                  }
                </span>
              </div>
              <div class="receipt-line__right">
                @if (line.savings) {
                  <span class="receipt-line__savings">−€{{ line.savings | number: '1.2-2' }}</span>
                }
                <span class="receipt-line__subtotal">€{{ line.subtotal | number: '1.2-2' }}</span>
              </div>
            </div>
          }
        </div>

        <div class="receipt__totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>€{{ r.totalWithoutOffers | number: '1.2-2' }}</span>
          </div>
          @if (r.totalSavings > 0) {
            <div class="totals-row totals-row--savings">
              <span>🏷️ Total savings</span>
              <span>−€{{ r.totalSavings | number: '1.2-2' }}</span>
            </div>
          }
          <div class="totals-row totals-row--grand">
            <span>Total paid</span>
            <span>€{{ r.totalPrice | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    } @else {
      <div class="receipt-placeholder">
        <span>🧾</span>
        <p>Your receipt will appear here after checkout.</p>
      </div>
    }
  `,
  styles: [`
    .receipt {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .receipt__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem 0.75rem;
      border-bottom: 1px dashed #e5e7eb;
      gap: 0.5rem;
    }
    .receipt__header-left { display: flex; flex-direction: column; gap: 0.15rem; }
    .receipt__header-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .receipt__title { margin: 0; font-size: 1.1rem; font-weight: 600; color: #1a1a2e; }
    .receipt__time { font-size: 0.75rem; color: #9ca3af; }
    .btn--pdf {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fff;
      color: #374151;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 4px 10px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn--pdf:hover { background: #f3f4f6; }
    .receipt__lines { padding: 0.75rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .receipt-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .receipt-line__left { display: flex; flex-direction: column; gap: 0.15rem; }
    .receipt-line__name { font-weight: 600; font-size: 0.9rem; }
    .receipt-line__detail { font-size: 0.78rem; color: #6b7280; display: flex; align-items: center; gap: 0.5rem; }
    .receipt-line__offer-badge {
      background: #dcfce7;
      color: #15803d;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .receipt-line__right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem; flex-shrink: 0; }
    .receipt-line__savings { font-size: 0.78rem; color: #16a34a; font-weight: 600; }
    .receipt-line__subtotal { font-weight: 700; font-size: 0.9rem; }
    .receipt__totals {
      border-top: 2px dashed #e5e7eb;
      padding: 0.75rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #374151;
    }
    .totals-row--savings { color: #16a34a; font-weight: 600; }
    .totals-row--grand {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1a1a2e;
      border-top: 1px solid #e5e7eb;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }
    .receipt-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #9ca3af;
      text-align: center;
      gap: 0.5rem;
      font-size: 2rem;
    }
    .receipt-placeholder p { font-size: 0.9rem; margin: 0; }
  `],
})
export class ReceiptPanelComponent {
  readonly receipt = input<CheckoutResponse | null>(null);
  readonly record = input<ReceiptRecord | null>(null);

  protected downloadPdf(r: CheckoutResponse): void {
    const date = new Date().toLocaleString();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Receipt - ${date}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 2rem; max-width: 600px; margin: 0 auto; color: #111; }
          h1 { font-size: 1.2rem; text-align: center; margin-bottom: 0.25rem; }
          .subtitle { text-align: center; color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
          .divider { border-top: 1px dashed #999; margin: 0.75rem 0; }
          .line { display: flex; justify-content: space-between; margin: 0.4rem 0; font-size: 0.9rem; }
          .line .left { flex: 1; }
          .line .right { font-weight: bold; }
          .offer-tag { color: #16a34a; font-size: 0.78rem; display: block; }
          .savings { color: #16a34a; }
          .grand { font-size: 1.1rem; font-weight: bold; margin-top: 0.5rem; }
          .footer { text-align: center; margin-top: 2rem; color: #888; font-size: 0.8rem; }
        </style>
      </head>
      <body>
        <h1>🛒 Supermarket Checkout</h1>
        <div class="subtitle">Receipt — ${date}</div>
        <div class="divider"></div>
        ${r.lineItems.map(line => `
          <div class="line">
            <div class="left">
              <strong>${line.name}</strong>
              <span style="color:#666; font-size:0.82rem"> × ${line.quantity} @ €${line.unitPrice.toFixed(2)}</span>
              ${line.offerGroupsApplied ? `<span class="offer-tag">🏷 ${line.offerGroupsApplied} offer applied — saved €${line.savings?.toFixed(2)}</span>` : ''}
            </div>
            <div class="right">€${line.subtotal.toFixed(2)}</div>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="line">
          <div class="left">Subtotal</div>
          <div class="right">€${r.totalWithoutOffers.toFixed(2)}</div>
        </div>
        ${r.totalSavings > 0 ? `
        <div class="line savings">
          <div class="left">🏷️ Total savings</div>
          <div class="right">−€${r.totalSavings.toFixed(2)}</div>
        </div>` : ''}
        <div class="divider"></div>
        <div class="line grand">
          <div class="left">TOTAL PAID</div>
          <div class="right">€${r.totalPrice.toFixed(2)}</div>
        </div>
        <div class="footer">Thank you for shopping with us!</div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  }
}