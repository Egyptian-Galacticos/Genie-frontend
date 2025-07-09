import { createAction, props } from '@ngrx/store';
import { Product, Category, ProductFilters, ProductSort } from '../interfaces/product.interface';

export const loadProducts = createAction(
  '[Products] Load Products',
  props<{
    filters?: ProductFilters;
    sort?: ProductSort;
    page?: number;
    size?: number;
  }>()
);

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{
    products: Product[];
    meta: {
      totalPages: number;
      limit: number;
      total: number;
      has_more_pages: boolean;
    };
    page: number;
  }>()
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: string }>()
);

export const loadProduct = createAction('[Products] Load Product', props<{ slug: string }>());

export const loadProductSuccess = createAction(
  '[Products] Load Product Success',
  props<{ product: Product }>()
);

export const loadProductFailure = createAction(
  '[Products] Load Product Failure',
  props<{ error: string }>()
);

export const clearProducts = createAction('[Products] Clear Products');
export const clearCurrentProduct = createAction('[Products] Clear Current Product');

export const loadCategories = createAction('[Products] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Products] Load Categories Success',
  props<{ categories: Category[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Products] Load Categories Failure',
  props<{ error: string }>()
);

export const updateProductWishlistStatus = createAction(
  '[Products] Update Product Wishlist Status',
  props<{ productId: number; isInWishlist: boolean }>()
);
