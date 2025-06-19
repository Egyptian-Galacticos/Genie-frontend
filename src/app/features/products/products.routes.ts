import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Products - Genie',
    loadComponent: () =>
      import('./pages/products-page/products-page.component').then(c => c.ProductsPageComponent),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent),
  },
];
