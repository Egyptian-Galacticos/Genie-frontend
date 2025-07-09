import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-featured-suppliers',
  imports: [CommonModule, ButtonModule, AnimateOnScrollDirective],
  templateUrl: './featured-suppliers.component.html',
  styleUrl: './featured-suppliers.component.css',
})
export class FeaturedSuppliersComponent {
  animationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 150,
  };

  features = signal<Feature[]>([
    {
      icon: 'pi pi-database',
      title: 'Advanced Data Analytics',
      description:
        'Gain insights into your business operations and make effective data-driven decisions.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      icon: 'pi pi-cloud',
      title: 'Scalable Cloud Solutions',
      description:
        'Grow and adapt with our scalable and secure cloud infrastructure for enterprises.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      icon: 'pi pi-cog',
      title: 'Integrated ERP Systems',
      description:
        'Streamline your processes with integrated ERP systems designed to boost productivity.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      icon: 'pi pi-shield',
      title: 'Robust Security Measures',
      description: 'Protect your enterprise with advanced security features ensuring data safety.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      icon: 'pi pi-headphones',
      title: '24/7 Customer Support',
      description:
        'Access our dedicated support team around the clock for any issues or questions.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      icon: 'pi pi-sliders-h',
      title: 'Customizable Solutions',
      description: 'Tailor our solutions to meet the specific needs of your business efficiently.',
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
  ]);
}
