import { Routes } from '@angular/router';
import { productTitleResolver } from './resolvers/product-title.resolver';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    title: 'Products - Genie',
    loadComponent: () =>
      import('./pages/products-page/products-page.component').then(c => c.ProductsPageComponent),
  },
  {
    path: ':slug',
    title: productTitleResolver,
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent),
  },
];
