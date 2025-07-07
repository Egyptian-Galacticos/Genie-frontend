import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.state';
import { ProductFilters, ProductSort } from '../interfaces/product.interface';
import { createCacheKey } from './products.utils';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectCurrentFilterPages = createSelector(
  selectProductsState,
  state => state.currentFilterPages
);

export const selectCurrentCacheKey = createSelector(
  selectProductsState,
  state => state.currentCacheKey
);

export const selectCurrentPage = createSelector(selectProductsState, state => state.currentPage);

export const selectCachedPage = (page: number = 1) =>
  createSelector(selectCurrentFilterPages, pages => {
    return pages[page] || null;
  });

export const selectProducts = createSelector(
  selectProductsState,
  selectCurrentFilterPages,
  (state, pages) => {
    const currentPageData = pages[state.currentPage];
    return currentPageData ? currentPageData.products : [];
  }
);

export const selectProductsMeta = createSelector(
  selectProductsState,
  selectCurrentFilterPages,
  (state, pages) => {
    const currentPageData = pages[state.currentPage];
    return currentPageData ? currentPageData.meta : null;
  }
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  state => state.productsLoading
);

export const selectProductsError = createSelector(
  selectProductsState,
  state => state.productsError
);

export const selectCurrentProduct = createSelector(
  selectProductsState,
  state => state.currentProduct
);

export const selectCurrentProductTimestamp = createSelector(
  selectProductsState,
  state => state.currentProductTimestamp
);

export const selectCurrentProductLoading = createSelector(
  selectProductsState,
  state => state.currentProductLoading
);

export const selectCurrentProductError = createSelector(
  selectProductsState,
  state => state.currentProductError
);

export const selectIsCurrentProductExpired = createSelector(
  selectCurrentProductTimestamp,
  timestamp => {
    if (!timestamp) return true;
    const PRODUCT_CACHE_EXPIRY = 10 * 60 * 1000;
    return Date.now() - timestamp > PRODUCT_CACHE_EXPIRY;
  }
);

export const selectCategories = createSelector(selectProductsState, state => state.categories);

export const selectCategoriesTimestamp = createSelector(
  selectProductsState,
  state => state.categoriesTimestamp
);

export const selectCategoriesLoading = createSelector(
  selectProductsState,
  state => state.categoriesLoading
);

export const selectCategoriesError = createSelector(
  selectProductsState,
  state => state.categoriesError
);

export const selectAreCategoriesExpired = createSelector(selectCategoriesTimestamp, timestamp => {
  if (!timestamp) return true;
  const CATEGORIES_CACHE_EXPIRY = 30 * 60 * 1000;
  return Date.now() - timestamp > CATEGORIES_CACHE_EXPIRY;
});

export const selectParentCategories = createSelector(selectCategories, categories =>
  categories.filter(category => !category.parent_id)
);

export const selectSubCategoriesByParentId = (parentId: number) =>
  createSelector(selectCategories, categories =>
    categories.filter(category => category.parent_id === parentId)
  );

export const selectIsPageCached = (
  filters: ProductFilters = {},
  sort: ProductSort = { field: 'created_at', direction: 'desc' },
  page: number = 1
) =>
  createSelector(selectCurrentFilterPages, selectCurrentCacheKey, (pages, currentCacheKey) => {
    const expectedCacheKey = createCacheKey(filters, sort);

    if (currentCacheKey !== expectedCacheKey) return false;

    const CACHE_EXPIRY = 5 * 60 * 1000;
    const pageData = pages[page];
    if (!pageData) return false;

    const isExpired = Date.now() - pageData.timestamp > CACHE_EXPIRY;
    return !isExpired;
  });
