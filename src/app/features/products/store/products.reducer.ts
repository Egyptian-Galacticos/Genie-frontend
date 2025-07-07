import { createReducer, on } from '@ngrx/store';
import * as ProductsActions from './products.actions';
import { Product } from '../interfaces/product.interface';
import { ProductsState } from './products.state';
import { createCacheKey } from './products.utils';

export const initialState: ProductsState = {
  currentFilterPages: {},
  currentCacheKey: null,
  currentPage: 1,
  productsLoading: false,
  productsError: null,

  currentProduct: null,
  currentProductTimestamp: null,
  currentProductLoading: false,
  currentProductError: null,

  categories: [],
  categoriesTimestamp: null,
  categoriesLoading: false,
  categoriesError: null,
};

export const productsReducer = createReducer(
  initialState,
  on(ProductsActions.loadProducts, (state, { filters, sort, page }): ProductsState => {
    const newCacheKey = createCacheKey(filters, sort);
    const shouldClearCache = state.currentCacheKey && state.currentCacheKey !== newCacheKey;

    return {
      ...state,
      currentFilterPages: shouldClearCache ? {} : state.currentFilterPages,
      currentCacheKey: newCacheKey,
      currentPage: page || 1,
      productsLoading: true,
      productsError: null,
    };
  }),

  on(ProductsActions.loadProductsSuccess, (state, { products, meta, page }): ProductsState => {
    const pageNumber = page || 1;
    const timestamp = Date.now();

    const updatedPages = {
      ...state.currentFilterPages,
      [pageNumber]: {
        products,
        meta,
        timestamp,
      },
    };

    return {
      ...state,
      currentFilterPages: updatedPages,
      currentPage: pageNumber,
      productsLoading: false,
      productsError: null,
    };
  }),

  on(
    ProductsActions.loadProductsFailure,
    (state, { error }): ProductsState => ({
      ...state,
      productsLoading: false,
      productsError: error,
    })
  ),

  on(
    ProductsActions.loadProduct,
    (state): ProductsState => ({
      ...state,
      currentProductLoading: true,
      currentProductError: null,
    })
  ),

  on(
    ProductsActions.loadProductSuccess,
    (state, { product }): ProductsState => ({
      ...state,
      currentProduct: product,
      currentProductTimestamp: Date.now(),
      currentProductLoading: false,
      currentProductError: null,
    })
  ),

  on(
    ProductsActions.loadProductFailure,
    (state, { error }): ProductsState => ({
      ...state,
      currentProductLoading: false,
      currentProductError: error,
    })
  ),

  on(
    ProductsActions.clearCurrentProduct,
    (state): ProductsState => ({
      ...state,
      currentProduct: null,
      currentProductTimestamp: null,
      currentProductLoading: false,
      currentProductError: null,
    })
  ),

  on(
    ProductsActions.clearProducts,
    (state): ProductsState => ({
      ...state,
      currentFilterPages: {},
      currentCacheKey: null,
      currentPage: 1,
    })
  ),

  on(
    ProductsActions.loadCategories,
    (state): ProductsState => ({
      ...state,
      categoriesLoading: true,
      categoriesError: null,
    })
  ),

  on(
    ProductsActions.loadCategoriesSuccess,
    (state, { categories }): ProductsState => ({
      ...state,
      categories,
      categoriesTimestamp: Date.now(),
      categoriesLoading: false,
      categoriesError: null,
    })
  ),

  on(
    ProductsActions.loadCategoriesFailure,
    (state, { error }): ProductsState => ({
      ...state,
      categoriesLoading: false,
      categoriesError: error,
    })
  ),

  on(
    ProductsActions.updateProductWishlistStatus,
    (state, { productId, isInWishlist }): ProductsState => {
      const updatedPages = { ...state.currentFilterPages };
      Object.keys(updatedPages).forEach(pageKey => {
        const pageNumber = parseInt(pageKey, 10);
        const page = updatedPages[pageNumber];
        if (page && page.products) {
          const productIndex = page.products.findIndex((p: Product) => p.id === productId);
          if (productIndex !== -1) {
            const updatedProducts = [...page.products];
            updatedProducts[productIndex] = {
              ...updatedProducts[productIndex],
              in_wishlist: isInWishlist,
            };
            updatedPages[pageNumber] = {
              ...page,
              products: updatedProducts,
            };
          }
        }
      });

      const updatedCurrentProduct =
        state.currentProduct && state.currentProduct.id === productId
          ? { ...state.currentProduct, in_wishlist: isInWishlist }
          : state.currentProduct;

      return {
        ...state,
        currentFilterPages: updatedPages,
        currentProduct: updatedCurrentProduct,
      };
    }
  )
);
