import { Component, type OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

interface CarouselImage {
  src: string;
  alt: string;
}

interface ThumbnailImage {
  src: string;
  alt: string;
}

interface RankingItem {
  title: string;
  category: string;
  popularityScore: number;
  thumbnails: ThumbnailImage[];
}

interface NewArrival {
  image: string;
  alt: string;
}

interface Deal {
  title: string;
  image: string;
}

@Component({
  selector: 'app-trending-products',
  imports: [CommonModule, CarouselModule, AnimateOnScrollDirective],
  templateUrl: './trending-products.component.html',
  styleUrl: './trending-products.component.css',
})
export class TrendingProductsComponent implements OnInit {
  carouselImages = signal<CarouselImage[]>([]);
  selectedImageIndex = signal<number>(0);

  topRanking = signal<RankingItem>({
    title: 'Most popular',
    category: 'LCL+Trucking',
    popularityScore: 4.5,
    thumbnails: [
      { src: '/product_1.jpg', alt: 'Popular product 1' },
      { src: '/product_2.jpg', alt: 'Popular product 2' },
      { src: '/product_3.jpg', alt: 'Popular product 3' },
    ],
  });

  newArrivals = signal<NewArrival[]>([
    {
      image: '/product_4.jpg',
      alt: 'New arrival product 4',
    },
    {
      image: '/product_5.jpg',
      alt: 'New arrival product 5',
    },
    {
      image: '/product_6.jpg',
      alt: 'New arrival product 6',
    },
    {
      image: '/product_7.jpg',
      alt: 'New arrival product 7',
    },
  ]);

  newThisWeek = signal({
    image: '/product_8.jpg',
    title: 'New this week',
    subtitle: 'Products from Verified Suppliers only',
  });

  topDeals = signal<Deal[]>([
    {
      title: '180-day lowest price',
      image: '/product_9.jpg',
    },
    {
      title: 'Deals on best sellers',
      image: '/product_10.jpg',
    },
    {
      title: 'Limited time offer',
      image: '/product_2.jpg',
    },
  ]);

  ngOnInit(): void {
    this.carouselImages.set([
      {
        src: '/product_11.jpg',
        alt: 'Featured product 11',
      },
      {
        src: '/product_12.jpg',
        alt: 'Featured product 12',
      },
      {
        src: '/product_13.jpg',
        alt: 'Featured product 13',
      },
      {
        src: '/product_1.jpg',
        alt: 'Featured product 1',
      },
    ]);
  }

  selectMainImage(index: number): void {
    this.selectedImageIndex.set(index);
  }
}
