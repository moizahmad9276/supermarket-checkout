import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  private counter = 0;

  success(message: string): void {
    this.push({ type: 'success', message });
  }

  error(message: string): void {
    this.push({ type: 'error', message });
  }

  info(message: string): void {
    this.push({ type: 'info', message });
  }

  dismiss(id: number): void {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private push(notification: Omit<Notification, 'id'>): void {
    const id = ++this.counter;
    this.notifications.update((list) => [...list, { id, ...notification }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
