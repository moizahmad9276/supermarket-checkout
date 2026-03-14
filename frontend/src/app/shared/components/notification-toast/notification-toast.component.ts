import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (n of notification.notifications(); track n.id) {
        <div class="toast toast--{{ n.type }}" (click)="notification.dismiss(n.id)">
          <span class="toast__icon">{{ icons[n.type] }}</span>
          <span class="toast__message">{{ n.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 9999;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: 8px;
      min-width: 280px;
      max-width: 420px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      animation: slideIn 0.25s ease;
      color: #fff;
    }
    .toast--success { background: #16a34a; }
    .toast--error   { background: #dc2626; }
    .toast--info    { background: #2563eb; }
    .toast__icon    { font-size: 1.1rem; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `],
})
export class NotificationToastComponent {
  protected readonly notification = inject(NotificationService);
  protected readonly icons = { success: '✅', error: '❌', info: 'ℹ️' };
}
