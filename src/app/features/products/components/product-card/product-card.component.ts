import {
  Component,
  computed,
  input,
  output,
  viewChild,
  ElementRef,
  effect,
  signal,
  PLATFORM_ID,
  inject,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { Product } from '../../interfaces/product.interface';

interface PriceRange {
  min: number;
  max: number;
  currency: string;
  hasRange: boolean;
}

@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    TooltipModule,
  ],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private resizeObserver: ResizeObserver | null = null;

  product = input.required<Product>();
  wishlistLoading = input<boolean>(false);
  brandFilterRequested = output<string>();
  wishlistToggleRequested = output<{ productId: number; isCurrentlyInWishlist: boolean }>();

  tagsContainer = viewChild<ElementRef>('tagsContainer');
  containerWidth = signal<number>(0);

  isInWishlist = computed(() => {
    return this.product().in_wishlist ?? false;
  });

  isWishlistLoading = computed(() => {
    return this.wishlistLoading();
  });

  constructor() {
    effect(() => {
      const container = this.tagsContainer();
      if (container && isPlatformBrowser(this.platformId)) {
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
        }
        if (typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
              this.containerWidth.set(entry.contentRect.width);
            }
          });
          this.resizeObserver.observe(container.nativeElement);
          this.containerWidth.set(container.nativeElement.offsetWidth);
        } else {
          this.containerWidth.set(container.nativeElement.offsetWidth);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  productRoute = computed(() => {
    const product = this.product();
    const identifier = product.slug || product.id;
    return ['/products', identifier];
  });

  productImage = computed(() => {
    const product = this.product();
    return {
      url: product.main_image?.url || '',
      alt: `${product.name} - Main Image`,
    };
  });

  priceRange = computed<PriceRange>(() => {
    const product = this.product();

    if (!product.tiers?.length) {
      return {
        min: 0,
        max: 0,
        currency: product.currency || 'USD',
        hasRange: false,
      };
    }

    const prices = product.tiers
      .map(tier => parseFloat(tier.price))
      .filter(price => !isNaN(price) && price > 0);

    if (!prices.length) {
      return {
        min: 0,
        max: 0,
        currency: product.currency || 'USD',
        hasRange: false,
      };
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      min: minPrice,
      max: maxPrice,
      currency: product.currency || 'USD',
      hasRange: minPrice !== maxPrice,
    };
  });

  isPriceValid = computed(() => {
    const range = this.priceRange();
    return range.min > 0 && !isNaN(range.min);
  });

  tagDisplay = computed(() => {
    const product = this.product();
    const tags = product.tags || [];
    const availableWidth = this.containerWidth();

    if (!tags.length || availableWidth === 0) {
      return {
        visibleTags: [],
        remainingTags: [],
        hasMore: false,
        remainingCount: 0,
        tooltipText: '',
      };
    }

    const estimateTagWidth = (text: string) => {
      const baseWidth = 16 + 2 + 8;
      const textWidth = text.length * 6;
      return baseWidth + textWidth;
    };

    const plusBadgeWidth = 30;

    let totalWidth = 0;
    const visibleTags: string[] = [];

    for (let i = 0; i < tags.length; i++) {
      const tagWidth = estimateTagWidth(tags[i]);
      const willNeedPlusBadge = i < tags.length - 1;
      const requiredWidth = totalWidth + tagWidth + (willNeedPlusBadge ? plusBadgeWidth : 0);

      if (requiredWidth <= availableWidth) {
        visibleTags.push(tags[i]);
        totalWidth += tagWidth;
      } else {
        break;
      }
    }

    const remainingTags = tags.slice(visibleTags.length);
    const tooltipText = remainingTags.join(', ');

    return {
      visibleTags,
      remainingTags,
      hasMore: remainingTags.length > 0,
      remainingCount: remainingTags.length,
      tooltipText,
    };
  });

  onBrandClick(event: Event, brand: string): void {
    this.brandFilterRequested.emit(brand);
  }

  onToggleWishlist(): void {
    this.wishlistToggleRequested.emit({
      productId: this.product().id,
      isCurrentlyInWishlist: this.isInWishlist(),
    });
  }
}
