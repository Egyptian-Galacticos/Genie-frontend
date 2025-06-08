import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/login.interface';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    ToastModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly environment = environment;

  readonly emailErrors = computed(() => {
    const control = this.loginForm.get('email');
    if (!control || !control.touched) return null;

    if (control.errors?.['required']) return 'Email is required';
    if (control.errors?.['email']) return 'Please enter a valid email address';
    return null;
  });

  readonly passwordErrors = computed(() => {
    const control = this.loginForm.get('password');
    if (!control || !control.touched) return null;

    if (control.errors?.['required']) return 'Password is required';
    if (control.errors?.['minlength']) return 'Password must be at least 6 characters';
    return null;
  });

  constructor() {
    effect(() => {
      const error = this.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error,
          life: 5000,
        });
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading()) {
      const formValue = this.loginForm.value;
      const loginRequest: LoginRequest = {
        email: formValue.email,
        password: formValue.password,
        remember_me: formValue.rememberMe,
      };

      this.loading.set(true);
      this.error.set(null);

      this.authService.login(loginRequest).subscribe({
        next: response => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Welcome!',
            detail: `Welcome back, ${response.data.user.first_name}!`,
            life: 3000,
          });

          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          const redirectUrl = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';
          this.router.navigate([redirectUrl]);
        },
        error: error => {
          this.loading.set(false);

          if (this.isAccountSuspended(error)) {
            this.router.navigate(['/auth/account-suspended']);
            return;
          }

          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.error.set(errorMessage);
          console.error('Login error:', error);
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Navigate to forgot password page
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to register page
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Clear form errors when user starts typing
   */
  onFieldFocus(): void {
    this.error.set(null);
  }

  /**
   * Check if the error indicates account suspension
   */
  private isAccountSuspended(error: { error?: { message?: string }; status?: number }): boolean {
    const is403Error = error.status === 403;
    const hasAccountSuspendedMessage = error.error?.message === 'Account suspended';

    return is403Error && hasAccountSuspendedMessage;
  }
}
