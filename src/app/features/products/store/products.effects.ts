import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductsService } from '../services/products.service';
import { ProductQuery } from '../interfaces/product.interface';
import * as ProductsActions from './products.actions';
import * as ProductsSelectors from './products.selectors';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private productsService = inject(ProductsService);

  loadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      concatLatestFrom(action => [
        this.store.select(
          ProductsSelectors.selectIsPageCached(
            action.filters || {},
            action.sort || { field: 'created_at', direction: 'desc' },
            action.page || 1
          )
        ),
        this.store.select(ProductsSelectors.selectCachedPage(action.page || 1)),
      ]),
      switchMap(([action, isPageCached, cachedPageData]) => {
        if (isPageCached && cachedPageData) {
          return of(
            ProductsActions.loadProductsSuccess({
              products: cachedPageData.products,
              meta: cachedPageData.meta,
              page: action.page || 1,
            })
          );
        }
        const query: ProductQuery = {
          filters: action.filters || {},
          sort: action.sort || { field: 'created_at', direction: 'desc' },
          page: action.page || 1,
          size: action.size || 12,
        };

        return this.productsService.getProductsWithFilters(query).pipe(
          map(response => {
            return ProductsActions.loadProductsSuccess({
              products: response.data,
              meta: response.meta,
              page: query.page,
            });
          }),
          catchError(error => {
            return of(ProductsActions.loadProductsFailure({ error: error.message }));
          })
        );
      })
    );
  });

  loadProduct$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProductsActions.loadProduct),
      concatLatestFrom(() => [
        this.store.select(ProductsSelectors.selectCurrentProduct),
        this.store.select(ProductsSelectors.selectIsCurrentProductExpired),
      ]),
      switchMap(([action, currentProduct, isExpired]) => {
        if (currentProduct && currentProduct.slug === action.slug && !isExpired) {
          return of(ProductsActions.loadProductSuccess({ product: currentProduct }));
        }

        return this.productsService.getProduct(action.slug).pipe(
          map(response => ProductsActions.loadProductSuccess({ product: response.data })),
          catchError(error => of(ProductsActions.loadProductFailure({ error: error.message })))
        );
      })
    );
  });

  loadCategories$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ProductsActions.loadCategories),
      concatLatestFrom(() => [
        this.store.select(ProductsSelectors.selectCategories),
        this.store.select(ProductsSelectors.selectAreCategoriesExpired),
      ]),
      filter(([, categories, areCategoriesExpired]) => {
        return !categories || categories.length === 0 || areCategoriesExpired;
      }),
      switchMap(() =>
        this.productsService.getCategories().pipe(
          map(response => ProductsActions.loadCategoriesSuccess({ categories: response.data })),
          catchError(error => of(ProductsActions.loadCategoriesFailure({ error: error.message })))
        )
      )
    );
  });
}
