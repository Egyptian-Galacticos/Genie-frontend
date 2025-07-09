import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-basic-product-info',
  imports: [ReactiveFormsModule, DividerModule, SelectModule, InputTextModule, TextareaModule],
  templateUrl: './basic-product-info.component.html',
})
export class BasicProductInfoComponent {
  productFormGroup = input.required<FormGroup>();
  countriesList = input.required<string[]>();
}
