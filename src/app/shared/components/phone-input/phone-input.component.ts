import { Component, forwardRef, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import {
  parsePhoneNumberWithError,
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  CountryCode,
} from 'libphonenumber-js';

interface Country {
  code: CountryCode;
  name: string;
  callingCode: string;
  flag: string;
}

@Component({
  selector: 'app-phone-input',
  imports: [CommonModule, FormsModule, SelectModule, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="phone-input-wrapper" [class.p-invalid]="isInvalid()">
      <p-select
        [options]="allCountries()"
        [ngModel]="selectedCountry()"
        optionLabel="name"
        optionValue="code"
        [filter]="true"
        filterBy="name,callingCode"
        placeholder="Select"
        (ngModelChange)="onCountryChange($event)"
        [disabled]="disabled()"
        [showClear]="false"
        styleClass="country-select border-none border-r-1"
        appendTo="body"
      >
        <ng-template pTemplate="selectedItem" let-country>
          @if (country) {
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ country.flag }}</span>
              <span class="text-sm font-mono text-surface-900 dark:text-surface-100">{{
                country.callingCode
              }}</span>
            </div>
          }
        </ng-template>
        <ng-template pTemplate="item" let-country>
          <div class="flex items-center gap-3 py-1">
            <span class="text-base">{{ country.flag }}</span>
            <span class="flex-1 text-sm">{{ country.name }}</span>
            <span class="text-xs font-mono text-surface-600 dark:text-surface-400">{{
              country.callingCode
            }}</span>
          </div>
        </ng-template>
      </p-select>

      <input
        type="tel"
        pInputText
        [ngModel]="phoneNumber()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        (input)="onPhoneNumberChange($event)"
        (blur)="onTouched()"
        class="phone-number-input border-l-2 border-gray-600 ml-2"
      />
    </div>
  `,
  styles: [
    `
      .phone-input-wrapper {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--p-inputtext-border-color);
        border-radius: var(--p-inputtext-border-radius, 8px);
        background: var(--p-inputtext-background);
        transition: all 0.2s ease;
        overflow: hidden;
        height: 38.4px;
      }

      .phone-input-wrapper:hover {
        border-color: var(--p-inputtext-hover-border-color);
      }

      .phone-input-wrapper:focus-within {
        border-color: var(--p-inputtext-focus-border-color);
        box-shadow: var(--p-inputtext-focus-shadow);
      }

      .phone-input-wrapper.p-invalid {
        border-color: var(--p-red-500);
      }

      .phone-input-wrapper.p-invalid:focus-within {
        border-color: var(--p-red-500);
        box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--p-red-500) 20%, transparent);
      }

      :host ::ng-deep .country-select {
        flex-shrink: 0;
        width: 110px;
      }

      :host ::ng-deep .country-select .p-select {
        border: none;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
      }

      .phone-number-input {
        flex: 1;
        border: none;
        border-left: 1px solid var(--p-surface-border);
        border-radius: 0;
        box-shadow: none;
        background: transparent;
        outline: none;
        padding: 0.75rem 1rem;
        font-size: var(--p-inputtext-font-size, 0.875rem);
        color: var(--p-inputtext-color);
      }

      .phone-number-input::placeholder {
        color: var(--p-inputtext-placeholder-color);
      }

      @media (max-width: 640px) {
        :host ::ng-deep .country-select {
          width: 90px;
        }
      }
    `,
  ],
})
export class PhoneInputComponent implements ControlValueAccessor {
  placeholder = input('+1 (555) 123-4567');
  disabled = input(false);

  readonly allCountries = signal<Country[]>([]);
  selectedCountry = signal<CountryCode>('US');
  phoneNumber = signal('');

  readonly isInvalid = computed(() => {
    const phone = this.phoneNumber();
    if (!phone) return false;

    try {
      const fullNumber = `+${getCountryCallingCode(this.selectedCountry())}${phone.replace(/\D/g, '')}`;
      return !isValidPhoneNumber(fullNumber, this.selectedCountry());
    } catch {
      return true;
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: string) => {};
  onTouched = () => {};

  constructor() {
    this.initializeCountries();
  }

  private initializeCountries() {
    const countryList = getCountries();
    const countryData = countryList
      .map(code => ({
        code,
        name: code,
        callingCode: `+${getCountryCallingCode(code)}`,
        flag: this.getCountryFlag(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    this.allCountries.set(countryData);
  }

  private getCountryFlag(code: CountryCode): string {
    return code
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  }

  onCountryChange(event: CountryCode) {
    this.selectedCountry.set(event);
    this.updateValue();
  }

  onPhoneNumberChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.phoneNumber.set(target.value);
    this.updateValue();
  }

  private updateValue() {
    const phoneNum = this.phoneNumber();
    if (phoneNum?.trim()) {
      try {
        const cleanNumber = phoneNum.replace(/\D/g, '');
        const fullNumber = `+${getCountryCallingCode(this.selectedCountry())}${cleanNumber}`;

        if (isValidPhoneNumber(fullNumber, this.selectedCountry())) {
          const parsed = parsePhoneNumberWithError(fullNumber, this.selectedCountry());
          this.onChange(parsed.format('E.164'));
        } else {
          this.onChange(fullNumber);
        }
      } catch {
        this.onChange('');
      }
    } else {
      this.onChange('');
    }
  }

  writeValue(value: string): void {
    if (value) {
      try {
        const parsed = parsePhoneNumberWithError(value);
        if (parsed) {
          this.selectedCountry.set(parsed.country || 'US');
          this.phoneNumber.set(parsed.nationalNumber);
        }
      } catch {
        this.phoneNumber.set(value);
      }
    } else {
      this.phoneNumber.set('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState(_isDisabled: boolean): void {}
}
