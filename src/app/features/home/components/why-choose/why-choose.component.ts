import { Component, OnInit, AfterViewInit, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

interface WhyChooseFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-why-choose',
  imports: [CommonModule],
  templateUrl: './why-choose.component.html',
  styleUrls: ['./why-choose.component.css'],
})
export class WhyChooseComponent implements OnInit, AfterViewInit {
  features: WhyChooseFeature[] = [];

  private elementRef = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.features = [
      {
        icon: 'pi pi-tags',
        title: 'Bulk Pricing & Discounts',
        description: 'Unlock exclusive savings on large orders.',
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
      {
        icon: 'pi pi-check-circle',
        title: 'Streamlined Ordering',
        description: 'Effortless procurement with intuitive tools.',
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
      {
        icon: 'pi pi-comments',
        title: 'Dedicated Support',
        description: 'Expert assistance whenever you need it.',
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
      {
        icon: 'pi pi-truck',
        title: 'Global Sourcing Network',
        description: 'Access a vast array of international suppliers.',
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
    ];
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const headerElements = this.elementRef.nativeElement.querySelectorAll(
        '.animate-item'
      ) as NodeListOf<HTMLElement>;

      const cards = this.elementRef.nativeElement.querySelectorAll(
        '.feature-card'
      ) as NodeListOf<HTMLElement>;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;

              if (el.classList.contains('animate-item')) {
                el.style.setProperty('--delay', `${index * 0.3}s`);
              } else {
                el.style.setProperty('--delay', `${0.6 + index * 0.2}s`);
              }

              el.classList.add('animate-in');
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.1 }
      );

      headerElements.forEach(el => observer.observe(el));
      cards.forEach(card => observer.observe(card));
    }
  }
}
