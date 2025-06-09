import { Component, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, CarouselResponsiveOptions } from 'primeng/carousel';

interface Category {
  id: string;
  name: string;
  icon: string;
  link?: string;
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, CarouselModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  private elementRef = inject(ElementRef<HTMLElement>);

  categories: Category[] = [];
  responsiveOptions: CarouselResponsiveOptions[] = [];

  ngOnInit(): void {
    this.categories = [
      { id: 'environment', name: 'Environment', icon: 'pi pi-chart-line' },
      { id: 'apparel', name: 'Apparel & Accessories', icon: 'pi pi-tag' },
      { id: 'home-garden', name: 'Home & Garden', icon: 'pi pi-home' },
      { id: 'beauty', name: 'Beauty', icon: 'pi pi-heart' },
      { id: 'vehicle', name: 'Vehicle Parts & Accessories', icon: 'pi pi-car' },
      { id: 'jewelry', name: 'Jewelry, Eyewear, ...', icon: 'pi pi-star' },
      { id: 'industrial', name: 'Industrial Machinery', icon: 'pi pi-cog' },
      { id: 'furniture', name: 'Furniture', icon: 'pi pi-building' },
      { id: 'business', name: 'Business Services', icon: 'pi pi-briefcase' },
      { id: 'electronics', name: 'Consumer Electronics', icon: 'pi pi-desktop' },
      { id: 'sports', name: 'Sports & Entertainment', icon: 'pi pi-trophy' },
      { id: 'commercial', name: 'Commercial Equipment & ...', icon: 'pi pi-box' },
      { id: 'packaging', name: 'Packaging & Printing', icon: 'pi pi-print' },
      { id: 'tools', name: 'Tools & Hardware', icon: 'pi pi-wrench' },
      { id: 'mother-kids', name: 'Mother, Kids & Toys', icon: 'pi pi-gift' },
      { id: 'shoes', name: 'Shoes & Accessories', icon: 'pi pi-shopping-bag' },
    ];

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 8,
        numScroll: 4,
      },
      {
        breakpoint: '1220px',
        numVisible: 6,
        numScroll: 3,
      },
      {
        breakpoint: '1024px',
        numVisible: 5,
        numScroll: 2,
      },
      {
        breakpoint: '768px',
        numVisible: 4,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 3,
        numScroll: 1,
      },
    ];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const animateElements = this.elementRef.nativeElement.querySelectorAll(
        '.animate-item'
      ) as NodeListOf<HTMLElement>;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.style.setProperty('--animate-delay', `${index * 0.1}s`);
              el.classList.add('animate-in');
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.1 }
      );

      animateElements.forEach(el => observer.observe(el));
    }, 100);
  }
}
