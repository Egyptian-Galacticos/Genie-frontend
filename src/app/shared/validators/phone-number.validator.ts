import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValidPhoneNumber } from 'libphonenumber-js';

export function phoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    try {
      const isValid = isValidPhoneNumber(control.value);
      return isValid ? null : { invalidPhoneNumber: true };
    } catch (error) {
      return { invalidPhoneNumber: true };
    }
  };
}
