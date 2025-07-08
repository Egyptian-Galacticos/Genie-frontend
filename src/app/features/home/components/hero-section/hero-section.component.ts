import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonModule, CommonModule, InputTextModule, AnimateOnScrollDirective],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  heroAnimationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 150,
    immediateAnimation: true,
    immediateCount: 6,
  };

  statsAnimationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 100,
    immediateAnimation: false,
    immediateCount: 0,
  };

  features = signal([
    {
      icon: 'pi pi-shield',
      title: 'Verified Suppliers',
      description: 'All suppliers are thoroughly vetted',
    },
    {
      icon: 'pi pi-globe',
      title: 'Global Network',
      description: 'Connect with suppliers worldwide',
    },
    {
      icon: 'pi pi-star',
      title: 'Quality Products',
      description: 'Premium products guaranteed',
    },
    {
      icon: 'pi pi-headphones',
      title: '24/7 Support',
      description: 'Round-the-clock assistance',
    },
  ]);

  stats = signal([
    { number: '50K+', label: 'Products' },
    { number: '10K+', label: 'Suppliers' },
    { number: '100+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
  ]);
}
