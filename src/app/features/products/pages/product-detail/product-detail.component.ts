import { Component, inject, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ProductsService } from '../../services/products.service';
import * as ProductsActions from '../../store/products.actions';
import * as ProductsSelectors from '../../store/products.selectors';
import * as isoCountries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

import { ProductGalleryComponent } from './components/product-gallery/product-gallery.component';
import { ProductInfoComponent } from './components/product-info/product-info.component';
import { ProductTabsComponent } from './components/product-tabs/product-tabs.component';
import { ProductBreadcrumbComponent } from './components/product-breadcrumb/product-breadcrumb.component';
import { RequestQuoteDialogComponent } from './components/request-quote-dialog/request-quote-dialog.component';

interface CountryOption {
  label: string;
  value: string;
}

type RfqField = 'quantity' | 'shipping_country' | 'shipping_address' | 'buyer_message';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    SkeletonModule,
    CardModule,
    ButtonModule,
    ProductGalleryComponent,
    ProductInfoComponent,
    ProductTabsComponent,
    ProductBreadcrumbComponent,
    RequestQuoteDialogComponent,
  ],
})
export class ProductDetailComponent {
  slug = input.required<string>();

  private store = inject(Store);
  private productsService = inject(ProductsService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  wishlistLoading = signal(false);
  activeTab = signal(0);
  showRequestQuoteDialog = signal(false);
  rfqFormData = signal({
    quantity: 1,
    shipping_country: '',
    shipping_address: '',
    buyer_message: '',
  });
  rfqLoading = signal(false);

  product = toSignal(this.store.select(ProductsSelectors.selectCurrentProduct), {
    initialValue: null,
  });
  loading = toSignal(this.store.select(ProductsSelectors.selectCurrentProductLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(ProductsSelectors.selectCurrentProductError), {
    initialValue: null,
  });

  breadcrumbItems = computed(() => {
    const product = this.product();
    if (!product) return [];

    return [
      {
        label: 'Products',
        routerLink: '/products',
        icon: 'pi pi-shopping-bag',
      },
      {
        label: product.name,
        disabled: true,
      },
    ];
  });

  breadcrumbHome = {
    icon: 'pi pi-home',
    label: 'Home',
    routerLink: '/',
  };

  pricingDisplay = computed(() => {
    const product = this.product();
    if (!product) return null;

    if (product.tiers && product.tiers.length > 0) {
      const lowestTier = product.tiers[0];
      return {
        hasPrice: true,
        price: lowestTier.price,
        currency: product.currency,
        isVolumePricing: product.tiers.length > 1,
        minQuantity: parseInt(lowestTier.from_quantity, 10),
      };
    }

    return {
      hasPrice: false,
      currency: product.currency,
      isVolumePricing: false,
    };
  });

  productSpecs = computed(() => {
    const product = this.product();
    if (!product) return [];

    const specs = [];

    if (product.brand) specs.push({ label: 'Brand', value: product.brand });
    if (product.model_number) specs.push({ label: 'Model', value: product.model_number });
    if (product.sku) specs.push({ label: 'SKU', value: product.sku });
    if (product.origin) specs.push({ label: 'Origin', value: product.origin });
    if (product.weight) specs.push({ label: 'Weight', value: product.weight });
    if (product.hs_code) specs.push({ label: 'HS Code', value: product.hs_code });

    if (product.dimensions) {
      const { length, width, height, unit } = product.dimensions;
      specs.push({
        label: 'Dimensions',
        value: `${length} × ${width} × ${height}` + (unit ? ` ${unit}` : ''),
      });
    }

    return specs;
  });

  companyInfo = computed(() => {
    const product = this.product();
    if (!product?.seller?.company) return null;

    return {
      name: product.seller.company.name,
      email: product.seller.company.email,
      phone: product.seller.company.company_phone,
      website: product.seller.company.website,
      logo: product.seller.company.logo,
      address: product.seller.company.address,
      isVerified: product.seller.company.is_email_verified,
    };
  });

  isProductOwner = computed(() => {
    const product = this.product();
    const currentUser = this.authService.user();

    if (!product || !currentUser) return false;

    return product.seller_id === currentUser.id;
  });

  canPerformBuyerActions = computed(() => {
    const isAuthenticated = this.authService.isAuthenticated();
    const isOwner = this.isProductOwner();

    return isAuthenticated && !isOwner;
  });

  countries = signal<CountryOption[]>([]);

  constructor() {
    isoCountries.registerLocale(enLocale);
    const countryData = isoCountries.getNames('en', { select: 'official' });
    const countryOptions: CountryOption[] = Object.entries(countryData)
      .map(([code, name]) => ({ label: name, value: code }))
      .sort((a, b) => a.label.localeCompare(b.label));
    this.countries.set(countryOptions);
  }

  onTabChange(event: { index: number }) {
    this.activeTab.set(event.index);
  }

  onDownloadDocument(url: string) {
    globalThis.window?.open(url, '_blank');
  }

  onWishlistToggle() {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isAuthenticated()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to add items to your wishlist',
        life: 4000,
        icon: 'pi pi-exclamation-triangle',
      });
      return;
    }

    if (this.isProductOwner()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Action Not Allowed',
        detail: 'You cannot add your own product to your wishlist',
        life: 4000,
        icon: 'pi pi-info-circle',
      });
      return;
    }

    this.wishlistLoading.set(true);

    if (product.in_wishlist) {
      this.productsService.removeFromWishlist(product.id).subscribe({
        next: response => {
          if (response.success) {
            this.store.dispatch(
              ProductsActions.updateProductWishlistStatus({
                productId: product.id,
                isInWishlist: false,
              })
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Removed from Wishlist',
              detail: response.message || 'Product removed from your wishlist successfully',
              life: 3000,
              icon: 'pi pi-heart',
            });
          }
        },
        error: (error: unknown) => {
          console.error('Failed to remove from wishlist:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove product from wishlist. Please try again.',
            life: 4000,
            icon: 'pi pi-exclamation-triangle',
          });
          this.wishlistLoading.set(false);
        },
        complete: () => {
          this.wishlistLoading.set(false);
        },
      });
    } else {
      this.productsService.addToWishlist(product.id).subscribe({
        next: response => {
          if (response.success) {
            this.store.dispatch(
              ProductsActions.updateProductWishlistStatus({
                productId: product.id,
                isInWishlist: true,
              })
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Added to Wishlist',
              detail: response.message || 'Product added to your wishlist successfully',
              life: 3000,
              icon: 'pi pi-heart-fill',
            });
          }
        },
        error: (error: unknown) => {
          console.error('Failed to add to wishlist:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add product to wishlist. Please try again.',
            life: 4000,
            icon: 'pi pi-exclamation-triangle',
          });
          this.wishlistLoading.set(false);
        },
        complete: () => {
          this.wishlistLoading.set(false);
        },
      });
    }
  }

  onRequestQuote() {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isAuthenticated()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please log in to request a quote',
        life: 4000,
        icon: 'pi pi-exclamation-triangle',
      });
      return;
    }

    if (this.isProductOwner()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Action Not Allowed',
        detail: 'You cannot request a quote for your own product',
        life: 4000,
        icon: 'pi pi-info-circle',
      });
      return;
    }

    this.rfqFormData.set({
      quantity: 1,
      shipping_country: '',
      shipping_address: '',
      buyer_message: '',
    });
    this.showRequestQuoteDialog.set(true);
  }

  onSubmitRfq() {
    const product = this.product();
    const formData = this.rfqFormData();

    if (!product) return;

    if (!formData.shipping_country || !formData.shipping_address) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required Fields Missing',
        detail: 'Please fill in all required fields',
        life: 4000,
        icon: 'pi pi-exclamation-triangle',
      });
      return;
    }

    this.rfqLoading.set(true);

    const rfqRequest = {
      seller_id: product.seller_id || 0,
      initial_product_id: product.id,
      initial_quantity: formData.quantity,
      shipping_country: formData.shipping_country,
      shipping_address: formData.shipping_address,
      buyer_message: formData.buyer_message,
    };

    this.productsService.createRfq(rfqRequest).subscribe({
      next: response => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Quote Request Submitted',
            detail:
              response.message ||
              'Your quote request has been submitted successfully. We will contact you soon.',
            life: 5000,
            icon: 'pi pi-check-circle',
          });
          this.showRequestQuoteDialog.set(false);
        }
      },
      error: (error: unknown) => {
        console.error('Failed to submit RFQ:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit quote request. Please try again.',
          life: 4000,
          icon: 'pi pi-exclamation-triangle',
        });
        this.rfqLoading.set(false);
        this.showRequestQuoteDialog.set(false);
      },
      complete: () => {
        this.rfqLoading.set(false);
      },
    });
  }

  onCancelRfq() {
    this.showRequestQuoteDialog.set(false);
  }

  updateRfqField(change: { fieldName: RfqField; fieldValue: unknown }) {
    this.rfqFormData.set({
      ...this.rfqFormData(),
      [change.fieldName]: change.fieldValue as never,
    });
  }
}
