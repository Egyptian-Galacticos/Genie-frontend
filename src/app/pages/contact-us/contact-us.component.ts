import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AnimateOnScrollDirective } from '../../shared/directives/animate-on-scroll.directive';

interface ContactInfo {
  icon: string;
  title: string;
  details: string[];
  color: string;
}

@Component({
  selector: 'app-contact-us',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    MessageModule,
    ToastModule,
    AnimateOnScrollDirective,
  ],
  providers: [MessageService],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements OnInit {
  private messageService = inject(MessageService);

  contactInfo = signal<ContactInfo[]>([]);
  inquiryTypes = signal([
    { label: 'General Inquiry', value: 'general' },
    { label: 'Sales', value: 'sales' },
    { label: 'Support', value: 'support' },
    { label: 'Partnership', value: 'partnership' },
    { label: 'Media', value: 'media' },
  ]);

  contactForm = signal({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: '',
  });

  formErrors = signal({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: '',
  });

  isSubmitting = signal(false);

  ngOnInit(): void {
    this.contactInfo.set([
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
        color: 'bg-gradient-to-br from-green-500 to-green-600',
      },
      {
        icon: 'pi pi-envelope',
        title: 'Email Us',
        details: ['info@company.com', 'support@company.com', 'sales@company.com'],
        color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      },
      {
        icon: 'pi pi-clock',
        title: 'Business Hours',
        details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM', 'Sunday: Closed'],
        color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      },
    ]);
  }

  onSubmit(): void {
    this.formErrors.set({
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: '',
    });

    const errors = this.validateForm();
    if (Object.values(errors).some(error => error !== '')) {
      this.formErrors.set(errors);
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      console.log('Form submitted:', this.contactForm());
      this.messageService.add({
        severity: 'success',
        summary: 'Message Sent!',
        detail: "Thank you for your message! We'll get back to you soon.",
        life: 5000,
      });
      this.resetForm();
      this.isSubmitting.set(false);
    }, 1000);
  }

  private validateForm() {
    const form = this.contactForm();
    const errors = {
      name: '',
      email: '',
      subject: '',
      message: '',
      inquiryType: '',
    };

    if (!form.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!form.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!form.message.trim()) {
      errors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }

    if (!form.inquiryType) {
      errors.inquiryType = 'Please select an inquiry type';
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateFormField(field: string, value: string): void {
    this.contactForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  private resetForm(): void {
    this.contactForm.set({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      inquiryType: '',
    });
  }
}
