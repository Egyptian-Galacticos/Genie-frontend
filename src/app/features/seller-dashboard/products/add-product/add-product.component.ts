import { CreateCategoryInProduct } from './../../../shared/utils/interfaces';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { ImageUploadComponent } from '../shared/components/image-upload/image-upload.component';
import { DocumentUploadComponent } from '../shared/components/document-upload/document-upload.component';
import { ProductService } from '../../../shared/services/product.service';

import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';
import * as arLocale from 'i18n-iso-countries/langs/ar.json';
import { ToastModule } from 'primeng/toast';
import { ApiResponse } from '../../../../core/interfaces/api.interface';
import { Router } from '@angular/router';
import { BasicProductInfoComponent } from '../shared/components/basic-product-info/basic-product-info.component';
import { PricingInfoComponent } from '../shared/components/princing-info/pricing-info.component';
import { ProductSpecsComponent } from '../shared/components/product-specs/product-specs.component';
import { ProductSampleAndTagsComponent } from '../shared/components/product-sample-and-tags/product-sample-and-tags.component';
import { CategoryComponent } from '../shared/components/category/category.component';
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    TextareaModule,
    ChipModule,
    SelectModule,
    AutoCompleteModule,
    ImageUploadComponent,
    DocumentUploadComponent,
    CategoryComponent,
    ToastModule,
    BasicProductInfoComponent,
    PricingInfoComponent,
    ProductSpecsComponent,
    ProductSampleAndTagsComponent,
  ],
  providers: [MessageService],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  countriesList: string[] = [];
  currencies = ['USD'];
  selectedCategory: CreateCategoryInProduct | null = null;
  loading = false;
  // Form
  productFormGroup = this.formBuilder.group({
    brand: [''],
    model_number: [''],
    sku: [''],
    hs_code: [''],
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: ['', [Validators.required, Validators.min(0.01)]],
    currency: ['USD', [Validators.required, this.validate_currency()]],
    origin: ['Egypt', [Validators.required, this.validate_origin()]],
    images_group: this.formBuilder.group({
      main_image: this.formBuilder.control<File | null>(null, [Validators.required]),
      images: this.formBuilder.control<File[]>([], [Validators.required, Validators.minLength(1)]),
    }),
    documents_group: this.formBuilder.group({
      documents: this.formBuilder.control<File[]>([], []),
      specifications: this.formBuilder.control<File[]>([], []),
    }),
    tags: this.formBuilder.control<string[]>([], [Validators.required, Validators.minLength(1)]),
    price_tiers: this.formBuilder.array([]),
    dimensions: this.formBuilder.group({
      length: [0, [Validators.required, Validators.min(0.01)]],
      width: [0, [Validators.required, Validators.min(0.01)]],
      height: [0, [Validators.required, Validators.min(0.01)]],
    }),
    weight: ['', [Validators.required, Validators.min(0.01)]],
    sample: this.formBuilder.group(
      {
        sample_available: [false, [Validators.required]],
        sample_price: [0],
      },
      {
        validators: this.validate_sample(),
      }
    ),
  });

  get images_group() {
    return this.productFormGroup.get('images_group') as FormGroup;
  }
  get documents_group() {
    return this.productFormGroup.get('documents_group') as FormGroup;
  }

  ngOnInit() {
    countries.registerLocale(enLocale);
    countries.registerLocale(arLocale);
    this.loadCountries('en');
  }
  loadCountries(locale: string) {
    const countryNames = countries.getNames(locale, { select: 'official' });

    this.countriesList = Object.entries(countryNames)
      .map(([, name]) => name)
      .sort((a, b) => a.localeCompare(b));
  }

  // Adding Product
  onSubmit() {
    const categoryResult = this.checkCategory();
    if (!categoryResult?.success || !categoryResult?.category_id) {
      this.showError('Please select a category');
      return;
    } else if (categoryResult.category_id == -1 && !categoryResult.categoryData) {
      this.showError('Please select a category');
      return;
    }
    this.loading = true;

    const formData = this.prepareRequestBody(
      categoryResult.category_id,
      categoryResult.categoryData
    );
    // Send both dto and formData if you have file uploads
    this.productService.createProduct(formData).subscribe({
      next: (res: ApiResponse) => {
        this.loading = false;
        this.showSuccess(res.message || 'Product added successfully!');
        this.router.navigate(['/dashboard/seller/products']);
      },
      error: err => {
        this.showError(err.message);
        console.error(err);
        this.loading = false;
      },
    });
  }

  prepareRequestBody(categoryId: number, CategoryData: CreateCategoryInProduct | null = null) {
    const raw = this.productFormGroup.getRawValue();
    const { dimensions, price_tiers, sample, images_group, documents_group, tags, ...dto } = raw;
    const formData = new FormData();

    // Handle images
    if (images_group) {
      for (const [key, value] of Object.entries(images_group)) {
        if (value instanceof Array) {
          value.forEach((file: File) => {
            if (file instanceof File) {
              formData.append(key + '[]', file);
            }
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        }
      }
    }

    // Handle documents
    if (documents_group) {
      for (const [key, value] of Object.entries(documents_group)) {
        if (value instanceof Array) {
          value.forEach((file: File) => {
            if (file instanceof File) {
              formData.append(key + '[]', file);
            }
          });
        }
      }
    }
    Object.entries(dto).forEach(([key, value]) => formData.append(key, String(value)));
    formData.append('sample_available', String(sample.sample_available ? 1 : 0));
    formData.append('sample_price', String(sample.sample_price));
    formData.append('category_id', String(categoryId));
    formData.append('category', JSON.stringify(CategoryData));
    formData.append('price_tiers', JSON.stringify(price_tiers));
    formData.append('dimensions', JSON.stringify(dimensions));
    formData.append('product_tags', JSON.stringify(tags));

    return formData;
  }

  // Validators

  private validate_origin(): ValidatorFn {
    return control => {
      return this.countriesList.includes(control.value) ? null : { invalid_origin: true };
    };
  }

  private validate_currency(): ValidatorFn {
    return control => {
      return this.currencies.includes(control.value) ? null : { invalid_currency: true };
    };
  }

  private validate_sample(): ValidatorFn {
    return control => {
      const sample_available = control.get('sample_available');
      const sample_price = control.get('sample_price');
      return sample_available && sample_price && sample_available.value && !sample_price.value
        ? { invalid_sample: true }
        : null;
    };
  }
  private checkCategory() {
    if (!this.selectedCategory) {
      this.showError('Please select a category');
      return { success: false };
    } else return { success: true, category_id: -1, categoryData: this.selectedCategory };
  }

  // Category Selection
  onCategorySelected(event: CreateCategoryInProduct | null) {
    this.selectedCategory = event;
  }

  //
  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }
}
