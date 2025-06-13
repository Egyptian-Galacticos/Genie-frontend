import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AnimationService } from '../../../../core/services/animation.service';

@Component({
  selector: 'app-get-started',
  imports: [CommonModule, ButtonModule],
  templateUrl: './get-started.component.html',
  styleUrl: './get-started.component.css',
  animations: [AnimationService.fadeInUp, AnimationService.staggerFadeIn],
})
export class GetStartedComponent implements AfterViewInit {
  private elementRef = inject(ElementRef<HTMLElement>);
  private animationService = inject(AnimationService);

  ngAfterViewInit(): void {
    this.animationService.animateElements(this.elementRef.nativeElement, ['.animate-item']);
  }
}
