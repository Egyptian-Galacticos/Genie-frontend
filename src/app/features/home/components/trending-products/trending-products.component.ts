import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

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
  imports: [CommonModule, CarouselModule],
  templateUrl: './trending-products.component.html',
  styleUrls: ['./trending-products.component.css'],
})
export class TrendingProductsComponent implements OnInit {
  carouselImages: CarouselImage[] = [];
  selectedImageIndex = 0;

  topRanking: RankingItem = {
    title: 'Most popular',
    category: 'LCL+Trucking',
    popularityScore: 4.5,
    thumbnails: [
      { src: '/unnamed.jpg?height=60&width=60&text=Saudi+Map', alt: 'Saudi Arabia logistics' },
      { src: '/unnamed.jpg?height=60&width=60&text=Green+Flag', alt: 'International shipping' },
      { src: '/unnamed.jpg?height=60&width=60&text=Plane+Model', alt: 'Air freight services' },
    ],
  };

  newArrivals: NewArrival[] = [
    {
      image: '/unnamed.jpg?height=150&width=150&text=China+to+USA+Shipping',
      alt: 'China to USA shipping',
    },
    {
      image: '/unnamed.jpg?height=150&width=150&text=DHL+Express+Delivery',
      alt: 'DHL Express delivery',
    },
    {
      image: '/unnamed.jpg?height=150&width=150&text=Worldwide+Shipping',
      alt: 'Worldwide shipping service',
    },
    {
      image: '/unnamed.jpg?height=150&width=150&text=Kids+Fashion+Clothes',
      alt: 'Kids fashion clothing',
    },
  ];

  newThisWeek = {
    image: '/unnamed.jpg?height=80&width=80&text=Wooden+Blocks',
    title: 'New this week',
    subtitle: 'Products from Verified Suppliers only',
  };

  topDeals: Deal[] = [
    {
      title: '180-day lowest price',
      image: '/unnamed.jpg?height=80&width=80&text=Coffee+Machine',
    },
    {
      title: 'Deals on best sellers',
      image: '/unnamed.jpg?height=200&width=300&text=Colorful+Waist+Bags+Grid',
    },
  ];

  ngOnInit(): void {
    this.carouselImages = [
      {
        src: '/unnamed.jpg?height=300&width=400&text=Freight+Forwarder+Main',
        alt: 'Main freight forwarding service',
      },
      {
        src: '/unnamed.jpg?height=300&width=400&text=Air+Cargo+Service',
        alt: 'Air cargo transportation',
      },
      {
        src: '/unnamed.jpg?height=300&width=400&text=Ocean+Freight',
        alt: 'Ocean freight shipping',
      },
      {
        src: '/unnamed.jpg?height=300&width=400&text=Truck+Logistics',
        alt: 'Ground transportation',
      },
    ];
  }

  selectMainImage(index: number): void {
    this.selectedImageIndex = index;
  }
}
