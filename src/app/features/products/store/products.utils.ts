import { ProductFilters, ProductSort } from '../interfaces/product.interface';

/**
 * Creates a unique cache key based on filters and sort parameters
 * Used to determine if cached data is still valid for the current filter combination
 */
export function createCacheKey(
  filters: ProductFilters = {},
  sort: ProductSort = { field: 'created_at', direction: 'desc' }
): string {
  const filterKey = Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'no_filters';
  const sortKey = `${sort.field}_${sort.direction}`;
  return `${filterKey}|${sortKey}`;
}
