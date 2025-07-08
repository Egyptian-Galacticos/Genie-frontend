import {
  Component,
  ElementRef,
  signal,
  viewChild,
  viewChildren,
  afterNextRender,
  inject,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

interface TeamMember {
  name: string;
  position: string;
  image: string;
  social: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

interface Stat {
  number: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
  imports: [CommonModule],
})
export class AboutUsComponent implements OnDestroy {
  private themeService = inject(ThemeService);

  teamMembers = signal<TeamMember[]>([
    {
      name: 'Ahmed Hassan',
      position: 'CEO & Founder',
      image: 'ahmed.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/ahmed-hassan',
        github: 'https://github.com/ahmed-hassan',
        email: 'ahmed@genie.com',
      },
    },
    {
      name: 'Mariam El-Sayed',
      position: 'CTO',
      image: 'mariam.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/mariam-elsayed',
        github: 'https://github.com/mariam-elsayed',
        email: 'mariam@genie.com',
      },
    },
    {
      name: 'Youssef Mahmoud',
      position: 'Head of Product',
      image: 'youssef.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/youssef-mahmoud',
        github: 'https://github.com/youssef-mahmoud',
        email: 'youssef@genie.com',
      },
    },
    {
      name: 'Rawan Ali',
      position: 'Head of Marketing',
      image: 'rawan.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/rawan-ali',
        email: 'rawan@genie.com',
      },
    },
    {
      name: 'Ibrahim Farouk',
      position: 'Lead Developer',
      image: 'ibrahim.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/ibrahim-farouk',
        github: 'https://github.com/ibrahim-farouk',
        email: 'ibrahim@genie.com',
      },
    },
    {
      name: 'Anas Khaled',
      position: 'UI/UX Designer',
      image: 'anas.jpg',
      social: {
        linkedin: 'https://linkedin.com/in/anas-khaled',
        email: 'anas@genie.com',
      },
    },
  ]);

  stats = signal<Stat[]>([
    {
      number: '10K+',
      label: 'Active Users',
      icon: 'pi pi-users',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      number: '500+',
      label: 'Partners',
      icon: 'pi pi-building',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      number: '50+',
      label: 'Countries',
      icon: 'pi pi-globe',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      number: '99.9%',
      label: 'Uptime',
      icon: 'pi pi-chart-line',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  ]);

  teamSection = viewChild<ElementRef>('teamSection');
  animatedElements = viewChildren<ElementRef>('animatedElement');

  private intersectionObserver?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      this.setupIntersectionObserver();
    });
  }

  ngOnDestroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupIntersectionObserver() {
    if (!this.animatedElements() || this.animatedElements().length === 0) return;

    const heroElements = this.animatedElements().slice(0, 4);
    heroElements.forEach((element, index) => {
      if (element.nativeElement) {
        setTimeout(() => {
          element.nativeElement.classList.add('animate-in');
        }, index * 200);
      }
    });

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const nonHeroElements = this.animatedElements().slice(4);
    nonHeroElements.forEach(element => {
      if (element.nativeElement) {
        this.intersectionObserver!.observe(element.nativeElement);
      }
    });
  }

  scrollToTeamSection() {
    const teamElement = this.teamSection();
    if (teamElement) {
      teamElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
