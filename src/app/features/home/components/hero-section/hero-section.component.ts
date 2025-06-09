import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AnimationService } from '../../../../core/services/animation.service';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonModule, CommonModule, InputTextModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
  animations: [AnimationService.fadeInUp, AnimationService.staggerFadeIn, AnimationService.scaleIn],
})
export class HeroSectionComponent {
  features = [
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
    { icon: 'pi pi-star', title: 'Quality Products', description: 'Premium products guaranteed' },
    { icon: 'pi pi-headphones', title: '24/7 Support', description: 'Round-the-clock assistance' },
  ];

  stats = [
    { number: '50K+', label: 'Products' },
    { number: '10K+', label: 'Suppliers' },
    { number: '100+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
  ];
}
