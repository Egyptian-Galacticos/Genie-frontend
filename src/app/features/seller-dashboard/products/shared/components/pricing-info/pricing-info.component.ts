import { Component, inject, input, OnInit } from '@angular/core';
import {
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-pricing-info',
  imports: [ReactiveFormsModule, DividerModule, InputTextModule, SelectModule, ButtonModule],
  templateUrl: './pricing-info.component.html',
})
export class PricingInfoComponent implements OnInit {
  productFormGroup = input.required<FormGroup>();
  currencies = input.required<string[]>();
  formBuilder = inject(FormBuilder);
  get price_tiers() {
    return this.productFormGroup().get('price_tiers') as FormArray;
  }
  ngOnInit(): void {
    if (this.price_tiers.length == 0) this.add_price_tier();
  }
  add_price_tier() {
    this.price_tiers.push(
      this.formBuilder.group(
        {
          price: [0, [Validators.required, Validators.min(0.01)]],
          from_quantity: [0, [Validators.required, Validators.min(1)]],
          to_quantity: [0, [Validators.required]],
        },
        { validators: this.validate_price_tier() }
      )
    );
  }
  private validate_price_tier(): ValidatorFn {
    return control => {
      const from_quantity = control.get('from_quantity');
      const to_quantity = control.get('to_quantity');
      return from_quantity && to_quantity && from_quantity.value > to_quantity.value
        ? { invalid_price_tier: true }
        : null;
    };
  }
}
