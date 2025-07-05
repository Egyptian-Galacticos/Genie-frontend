import { Product, Category } from '../interfaces/product.interface';

export interface CachedPage {
  products: Product[];
  meta: {
    totalPages: number;
    limit: number;
    total: number;
    has_more_pages: boolean;
  };
  timestamp: number;
}

export interface ProductsState {
  currentFilterPages: Record<number, CachedPage>;
  currentCacheKey: string | null;
  currentPage: number;
  productsLoading: boolean;
  productsError: string | null;

  currentProduct: Product | null;
  currentProductTimestamp: number | null;
  currentProductLoading: boolean;
  currentProductError: string | null;

  categories: Category[];
  categoriesTimestamp: number | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
}
