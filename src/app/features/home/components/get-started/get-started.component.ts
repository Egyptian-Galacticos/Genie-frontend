import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AnimateOnScrollDirective } from '../../../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-get-started',
  imports: [CommonModule, ButtonModule, AnimateOnScrollDirective],
  templateUrl: './get-started.component.html',
  styleUrl: './get-started.component.css',
})
export class GetStartedComponent {
  animationConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 200,
  };
}
