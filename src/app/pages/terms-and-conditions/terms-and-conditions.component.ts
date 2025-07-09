import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [CommonModule, RouterLink, AnimateOnScrollDirective],
  templateUrl: './terms-and-conditions.component.html',
  styleUrl: './terms-and-conditions.component.css',
})
export class TermsAndConditionsComponent {
  lastUpdated = signal('June 10, 2025');

  introductionSection = viewChild<ElementRef>('introductionSection');
  contactSection = viewChild<ElementRef>('contactSection');

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();

    const sectionMap = {
      introduction: this.introductionSection,
      contact: this.contactSection,
    };

    const sectionRef = sectionMap[sectionId as keyof typeof sectionMap];
    if (sectionRef) {
      const element = sectionRef();
      if (element) {
        element.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }
}
