import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OfferService {

  offerStatus(validUntil: string | null, now: number): 'expired' | 'soon' | 'active' {
    if (!validUntil) return 'active';
    const diff = new Date(validUntil).getTime() - now;
    if (diff <= 0) return 'expired';
    if (diff < 24 * 60 * 60 * 1000) return 'soon';
    return 'active';
  }

  expiryLabel(validUntil: string | null, now: number): string {
    if (!validUntil) return '';
    const diff = new Date(validUntil).getTime() - now;
    if (diff <= 0) return '';

    const date = new Date(validUntil);
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    let countdown = '';
    if (hours < 1) {
      countdown = `${mins}m ${secs}s`;
    } else if (hours < 24) {
      countdown = `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(hours / 24);
      countdown = `${days}d ${hours % 24}h`;
    }

    return `⏳ Expires ${dateStr} at ${timeStr} (in ${countdown})`;
  }
}