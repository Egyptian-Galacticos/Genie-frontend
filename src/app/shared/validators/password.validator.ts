import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const password_confirmation = control.get('password_confirmation');

    if (!password || !password_confirmation) {
      return null;
    }

    return password.value === password_confirmation.value ? null : { passwordMismatch: true };
  };
}
