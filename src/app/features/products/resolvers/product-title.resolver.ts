import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take, filter, catchError, of, timeout } from 'rxjs';
import * as ProductsActions from '../store/products.actions';
import * as ProductsSelectors from '../store/products.selectors';

export const productTitleResolver: ResolveFn<string> = route => {
  const store = inject(Store);
  const slug = route.params['slug'];

  if (!slug) {
    return of('Product - Genie');
  }

  store.dispatch(ProductsActions.loadProduct({ slug }));

  return store.select(ProductsSelectors.selectCurrentProduct).pipe(
    filter(product => product !== null && product.slug === slug),
    map(product => `${product!.name} - Genie`),
    take(1),
    timeout(10000),
    catchError(() => of('Product - Genie'))
  );
};
