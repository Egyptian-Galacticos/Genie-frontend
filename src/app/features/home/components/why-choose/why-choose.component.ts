import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

interface WhyChooseFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-why-choose',
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './why-choose.component.html',
  styleUrls: ['./why-choose.component.css'],
})
export class WhyChooseComponent implements OnInit {
  features = signal<WhyChooseFeature[]>([]);

  ngOnInit(): void {
    this.features.set([
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
    ]);
  }
}
