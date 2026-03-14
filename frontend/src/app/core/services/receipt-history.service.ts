import { Injectable, signal } from '@angular/core';
import { CheckoutResponse } from '../models/checkout.models';

export interface ReceiptRecord {
  id: string;
  timestamp: Date;
  receipt: CheckoutResponse;
}

const SESSION_KEY = 'supermarket_receipt_history';

@Injectable({ providedIn: 'root' })
export class ReceiptHistoryService {
  private readonly _history = signal<ReceiptRecord[]>(this.loadFromSession());

  readonly history = this._history.asReadonly();

  add(receipt: CheckoutResponse): ReceiptRecord {
    const record: ReceiptRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      receipt,
    };
    this._history.update((h) => [record, ...h]);
    this.saveToSession();
    return record;
  }

  clear(): void {
    this._history.set([]);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private saveToSession(): void {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this._history()));
    } catch {}
  }

  private loadFromSession(): ReceiptRecord[] {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ReceiptRecord[];
      return parsed.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }));
    } catch {
      return [];
    }
  }
}