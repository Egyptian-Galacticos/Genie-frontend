import {
  Component,
  ElementRef,
  signal,
  viewChild,
  viewChildren,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
  teamMembers = signal<TeamMember[]>([
    {
      name: 'Rawan Ali',
      position: 'Front End',
      image: '/rawan.jpg?height=300&width=300',
      social: {
        linkedin: 'https://www.linkedin.com/in/rawan-ali-ezzat',
        github: 'https://github.com/Rouali',
        email: 'rewanali82@gmail.com',
      },
    },
    {
      name: 'Ahmed Zahran',
      position: 'Front End',
      image: '/ahmed.jpg?height=300&width=300',
      social: {
        linkedin: 'https://www.linkedin.com/in/ahmedzahran1/',
        github: 'https://github.com/AhmedZahran15',
        email: 'ahmedzhran876@gmail.com',
      },
    },
    {
      name: 'Ibrahim Salama',
      position: 'Front End',
      image: '/ibrahim.jpg?height=300&width=300',
      social: {
        linkedin: 'https://www.linkedin.com/in/ibrahim--salama/',
        github: 'https://github.com/IbrahimSalama01',
        email: 'ibrahimsalama100@outlook.com',
      },
    },
    {
      name: 'Mariam Elzeki',
      position: 'Back End',
      image: '/mariam.jpg?height=300&width=300',
      social: {
        linkedin: 'https://www.linkedin.com/in/mariam-elzeki-/',
        github: 'https://github.com/marriaammm',
        email: 'mariamahmedelzeki@gmail.com',
      },
    },
    {
      name: 'Youssef Goma',
      position: 'Back End',
      image: '/youssef.jpg?height=300&width=300',
      social: {
        linkedin: 'https://www.linkedin.com/in/youssefgoma/',
        github: 'https://github.com/YoussefGoma',
        email: 'Youssef.goma.k@gmail.com',
      },
    },
    {
      name: 'Anas nashat',
      position: 'Back End',
      image: '/anas.jpg?height=300&width=300',
      social: {
        linkedin:
          'https://www.linkedin.com/in/anasnashat?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        github: 'https://github.com/anasnashat',
        email: 'anas.nashat.ahmed@gmail.com',
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
