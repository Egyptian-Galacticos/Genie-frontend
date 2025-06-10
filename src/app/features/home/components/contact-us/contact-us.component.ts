import { Component, AfterViewInit, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

interface ContactInfo {
  icon: string;
  title: string;
  details: string[];
  color: string;
}

interface ContactForm {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
}

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, SelectModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements AfterViewInit {
  contactInfo: ContactInfo[] = [];
  inquiryTypes = [
    { label: 'General Inquiry', value: 'general' },
    { label: 'Sales', value: 'sales' },
    { label: 'Support', value: 'support' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Media', value: 'media' },
  ];

  contactForm: ContactForm = {
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: '',
  };

  private elementRef = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.contactInfo = [
      {
        icon: 'pi pi-map-marker',
        title: 'Visit Us',
        details: ['123 Business Street', 'Suite 100', 'New York, NY 10001'],
        color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      },
      {
        icon: 'pi pi-phone',
        title: 'Call Us',
        details: ['+1 (555) 123-4567', '+1 (555) 987-6543', 'Mon-Fri 9AM-6PM EST'],
        color: 'bg-gradient-to-br from-accent2-500 to-accent2-600',
      },
      {
        icon: 'pi pi-envelope',
        title: 'Email Us',
        details: ['info@company.com', 'support@company.com', 'sales@company.com'],
        color: 'bg-gradient-to-br from-accent-500 to-accent-600',
      },
      {
        icon: 'pi pi-clock',
        title: 'Business Hours',
        details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM', 'Sunday: Closed'],
        color: 'bg-gradient-to-br from-accent1-500 to-accent1-600',
      },
    ];
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const animateElements = this.elementRef.nativeElement.querySelectorAll(
          '.animate-item, .contact-card, .form-element'
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

  onSubmit(): void {
    console.log('Form submitted:', this.contactForm);
    alert("Thank you for your message! We'll get back to you soon.");
    this.resetForm();
  }

  private resetForm(): void {
    this.contactForm = {
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      inquiryType: '',
    };
  }
}
