import { Component, inject, input, OnInit, output } from '@angular/core';
import { CreateCategoryInProduct, ProductWithErrors } from '../../../../shared/utils/interfaces';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import * as countries from 'i18n-iso-countries';
import * as enLocale from 'i18n-iso-countries/langs/en.json';
import * as arLocale from 'i18n-iso-countries/langs/ar.json';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BasicProductInfoComponent } from '../../../products/shared/components/basic-product-info/basic-product-info.component';
import { PricingInfoComponent } from '../../../products/shared/components/princing-info/pricing-info.component';
import { ProductSpecsComponent } from '../../../products/shared/components/product-specs/product-specs.component';
import { ProductSampleAndTagsComponent } from '../../../products/shared/components/product-sample-and-tags/product-sample-and-tags.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-edit-product',
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
    ToastModule,
    BasicProductInfoComponent,
    PricingInfoComponent,
    ProductSpecsComponent,
    ProductSampleAndTagsComponent,
  ],
  templateUrl: './edit-product.component.html',
})
export class EditProductComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private messageService = inject(MessageService);

  // Angular 19 signals
  beingEditedProduct = input.required<ProductWithErrors | null>();
  productUpdated = output<ProductWithErrors>();

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
      main_image: this.formBuilder.control<File | null>(null),
      images: this.formBuilder.control<File[]>([]),
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
    const product = this.beingEditedProduct();
    if (!product) {
      this.showError('No product data provided for editing.');
      return;
    }
    this.productFormGroup.patchValue({
      brand: product.brand,
      model_number: product.model_number,
      sku: product.sku,
      hs_code: product.hs_code,
      name: product.name,
      description: product.description,
      currency: product.currency,
      origin: product.origin,
      weight: product.weight.toString(),
      tags: product.product_tags || [],
    });

    // Handle nested form groups separately
    this.productFormGroup.get('dimensions')?.patchValue({
      length: product.dimensions?.length,
      width: product.dimensions?.width,
      height: product.dimensions?.height,
    });

    this.productFormGroup.get('sample')?.patchValue({
      sample_available: product.sample_available,
      sample_price: product.sample_price || 0,
    });

    // Handle price tiers
    const price_tiers = this.productFormGroup.get('price_tiers') as FormArray;
    if (product.price_tiers) {
      product.price_tiers.forEach(tier => {
        price_tiers.push(
          this.formBuilder.group(
            {
              from_quantity: tier.from_quantity,
              to_quantity: tier.to_quantity,
              price: tier.price,
            },
            { validators: this.validate_price_tier() }
          )
        );
      });
    }
  }
  loadCountries(locale: string) {
    const countryNames = countries.getNames(locale, { select: 'official' });

    this.countriesList = Object.entries(countryNames)
      .map(([, name]) => name)
      .sort((a, b) => a.localeCompare(b));
  }

  // Adding Product
  onSubmit() {
    this.loading = true;

    // For bulk upload editing, we just update the local data
    try {
      const formData = this.productFormGroup.getRawValue();
      const { dimensions, sample, tags, ...basicData } = formData;

      const updatedProduct: ProductWithErrors = {
        ...this.beingEditedProduct()!,
        brand: basicData.brand || undefined,
        model_number: basicData.model_number || undefined,
        sku: basicData.sku || '',
        hs_code: basicData.hs_code || undefined,
        name: basicData.name || '',
        description: basicData.description || '',
        currency: basicData.currency || 'USD',
        origin: basicData.origin || '',
        weight: Number(basicData.weight) || 0,
        dimensions: {
          length: Number(dimensions.length) || 0,
          width: Number(dimensions.width) || 0,
          height: Number(dimensions.height) || 0,
        },
        sample_available: Boolean(sample.sample_available),
        sample_price: Number(sample.sample_price) || undefined,
        product_tags: Array.isArray(tags) ? tags : [],
        price_tiers: this.beingEditedProduct()?.price_tiers || null,

        errors: [], // Will be revalidated by parent
      };

      this.loading = false;
      this.showSuccess('Product updated successfully!');
      this.productUpdated.emit(updatedProduct);
    } catch (error) {
      this.showError('Failed to update product. Please try again.');
      this.loading = false;
    }
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
  private validate_price_tier(): ValidatorFn {
    return control => {
      const from_quantity = control.get('from_quantity');
      const to_quantity = control.get('to_quantity');
      return from_quantity && to_quantity && from_quantity.value > to_quantity.value
        ? { invalid_price_tier: true }
        : null;
    };
  }

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

  onCancel() {
    // For bulk upload, we don't navigate, just emit null to close
    this.productUpdated.emit(this.beingEditedProduct()!);
  }
}
