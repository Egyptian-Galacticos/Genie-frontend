import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { Product, MediaFile } from '../../../../interfaces/product.interface';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.component.html',
  imports: [CommonModule, GalleriaModule, SkeletonModule, BadgeModule],
})
export class ProductGalleryComponent {
  product = input<Product | null>(null);
  loading = input<boolean>(false);

  activeIndex = signal<number>(0);
  fullScreenVisible = signal<boolean>(false);

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 6,
    },
    {
      breakpoint: '1200px',
      numVisible: 5,
    },
    {
      breakpoint: '1024px',
      numVisible: 4,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '640px',
      numVisible: 2,
    },
    {
      breakpoint: '480px',
      numVisible: 1,
    },
  ];

  // Computed gallery images
  galleryImages = computed(() => {
    const product = this.product();
    if (!product) return [];

    const images: MediaFile[] = [];
    if (product.main_image) {
      images.push(product.main_image);
    }
    if (product.images) {
      images.push(...product.images);
    }
    return images;
  });

  onActiveIndexChange(index: number) {
    this.activeIndex.set(index);
  }

  openFullScreen() {
    this.fullScreenVisible.set(true);
  }

  closeFullScreen() {
    this.fullScreenVisible.set(false);
  }

  onFullScreenVisibilityChange(visible: boolean) {
    this.fullScreenVisible.set(visible);
  }
}
