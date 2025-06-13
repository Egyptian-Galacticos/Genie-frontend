import { Component, input, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  CountryOption,
  UserRoleOption,
  CompanyFormData,
} from '../../../../interfaces/register.interface';
import { PhoneInputComponent } from '../phone-input.component';
import { phoneNumberValidator } from '../../../../validators/phone-number.validator';

@Component({
  selector: 'app-company-info-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    MessageModule,
    CardModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    PhoneInputComponent,
  ],
  templateUrl: './company-info-step.component.html',
})
export class CompanyInfoStepComponent implements OnInit {
  private fb = inject(FormBuilder);

  roles = input.required<UserRoleOption[]>();
  countries = input.required<CountryOption[]>();
  initialData = input<CompanyFormData | null>(null);

  nextStep = output<CompanyFormData>();

  companyForm!: FormGroup;

  constructor() {
    this.createForm();
  }

  ngOnInit() {
    if (this.initialData()) {
      this.companyForm.patchValue(this.initialData()!);
    }
  }

  private createForm() {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      company_phone: ['', [Validators.required, phoneNumberValidator()]],
      role: [null, Validators.required],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      stateProvince: ['', Validators.required],
      zipPostalCode: ['', Validators.required],
      country: [null, Validators.required],
    });
  }

  onNext() {
    if (this.companyForm.valid) {
      const formData = this.companyForm.value as CompanyFormData;
      this.nextStep.emit(formData);
    }
  }

  get formValue(): CompanyFormData {
    return this.companyForm.value as CompanyFormData;
  }

  get isValid(): boolean {
    return this.companyForm.valid;
  }
}
