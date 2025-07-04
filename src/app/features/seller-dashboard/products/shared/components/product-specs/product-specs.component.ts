import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-specs',
  imports: [ReactiveFormsModule, DividerModule, InputTextModule, InputNumberModule],
  templateUrl: './product-specs.component.html',
})
export class ProductSpecsComponent {
  productFormGroup = input.required<FormGroup>();
}
