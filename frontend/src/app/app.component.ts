import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationToastComponent],
  template: `
    <div class="app-shell">
      <header class="navbar">
        <div class="navbar__brand">
          <span class="navbar__logo">🛒</span>
          <span class="navbar__title">Supermarket Checkout</span>
        </div>
        <nav class="navbar__nav">
          <a routerLink="/checkout" routerLinkActive="navbar__link--active" class="navbar__link">
            Checkout
          </a>
          <a routerLink="/items" routerLinkActive="navbar__link--active" class="navbar__link">
            Manage Items
          </a>
        </nav>
      </header>

      <main class="main-content">
        <router-outlet />
      </main>

      <app-notification-toast />
    </div>
  `,
  styles: [`
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 64px;
      background: #1a1a2e;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar__brand { display: flex; align-items: center; gap: 0.75rem; }
    .navbar__logo { font-size: 1.5rem; }
    .navbar__title { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.02em; }

    .navbar__nav { display: flex; gap: 0.5rem; }

    .navbar__link {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .navbar__link:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .navbar__link--active { background: #e94560; color: #fff; }

    .main-content { flex: 1; padding: 2rem; max-width: 1200px; margin: 0 auto; width: 100%; }
  `],
})
export class AppComponent {}
