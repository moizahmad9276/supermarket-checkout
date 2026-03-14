import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'checkout',
    pathMatch: 'full',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/pages/checkout-page/checkout-page.component').then(
        (m) => m.CheckoutPageComponent
      ),
    title: 'Checkout',
  },
  {
    path: 'items',
    loadComponent: () =>
      import('./features/items/pages/items-page/items-page.component').then(
        (m) => m.ItemsPageComponent
      ),
    title: 'Manage Items',
  },
  {
    path: '**',
    redirectTo: 'checkout',
  },
];
