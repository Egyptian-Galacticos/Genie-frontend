import {
  Component,
  type OnInit,
  type AfterViewInit,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements OnInit, AfterViewInit {
  teamMembers: TeamMember[] = [];
  stats: Stat[] = [];

  private elementRef = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.stats = [
      {
        number: '10,000+',
        label: 'Happy Customers',
        icon: 'pi pi-users',
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
      {
        number: '500+',
        label: 'Verified Suppliers',
        icon: 'pi pi-check-circle',
        color: 'bg-gradient-to-br from-accent2-500 to-accent2-600',
      },
      {
        number: '50+',
        label: 'Countries Served',
        icon: 'pi pi-globe',
        color: 'bg-gradient-to-br from-accent-500 to-accent-600',
      },
      {
        number: '99.9%',
        label: 'Uptime Guarantee',
        icon: 'pi pi-shield',
        color: 'bg-gradient-to-br from-accent1-500 to-accent1-600',
      },
    ];

    this.teamMembers = [
      {
        name: 'Rawan ALi',
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
    ];
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const animateElements = this.elementRef.nativeElement.querySelectorAll(
          '.animate-item, .stat-card, .team-card'
        ) as NodeListOf<HTMLElement>;

        const observer = new IntersectionObserver(
          entries => {
            entries.forEach((entry, index) => {
              if (entry.isIntersecting) {
                const el = entry.target as HTMLElement;
                el.style.setProperty('--animate-delay', `${index * 0.1}s`);
                el.classList.add('animate-in');
                observer.unobserve(el);
              }
            });
          },
          { threshold: 0.1, rootMargin: '-10% 0px -10% 0px' }
        );

        animateElements.forEach(el => observer.observe(el));
      }, 100);
    }
  }
}
