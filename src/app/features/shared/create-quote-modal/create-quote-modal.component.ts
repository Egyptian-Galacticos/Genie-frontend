import { ProductService } from './../services/product.service';
import { IProduct } from './../utils/interfaces';
import { Component, inject, input, model, OnInit, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { CreateQuoteDto, CreateQuoteItemDto, IRequestForQuote } from '../utils/interfaces';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';

interface IQuoteItem {
  product: IProduct;
  quantity: number;
  unit_price: number;
  notes: string;
}
@Component({
  selector: 'app-create-quote-modal',
  imports: [
    DialogModule,
    FormsModule,
    ButtonModule,
    DividerModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    AutoComplete,
    TextareaModule,
  ],
  templateUrl: './create-quote-modal.component.html',
})
export class CreateQuoteModalComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);
  quoteSent = output<Partial<CreateQuoteDto>>();

  visible = model.required<boolean>();
  quoteRequest = input<IRequestForQuote>();
  singleItem = input<boolean>(true);
  loading = input.required<boolean>();
  products: IProduct[] = [];
  filteredProducts = [...this.products];

  quoteFormGroup = this.formBuilder.group({
    quoteItemFormArray: this.formBuilder.array<IQuoteItem>([]),
    seller_message: ['', Validators.required],
  });
  get quoteItems() {
    return this.quoteFormGroup.get('quoteItemFormArray') as FormArray;
  }

  ngOnInit(): void {
    this.addQuoteItem();
    if (!this.singleItem) {
      this.getProductsToSearch();
    }
  }
  /**  Adds a quote item to the form array (if quoteRequest is not null then the product field is disabled and product is set to quoteRequest.product) */
  addQuoteItem() {
    this.quoteItems.push(
      this.formBuilder.group({
        id: [Date.now() + Math.random()],
        product: [
          {
            value: this.quoteRequest()?.initial_product || '',
            disabled: this.quoteRequest() ? true : false,
          },
          [Validators.required, this.invalidProduct()],
        ],
        unit_price: [
          this.quoteRequest()?.unit_price || 1,
          [Validators.required, Validators.min(1)],
        ],
        quantity: [this.quoteRequest()?.quantity || 1, [Validators.required, Validators.min(1)]],
        notes: [''],
      })
    );
  }
  removeQuoteItem(index: number) {
    if (this.quoteItems.length > 1) {
      this.quoteItems.removeAt(index);
    }
  }
  /**Close the modal and change the visible state in the parent */
  close() {
    this.visible.update(() => false);
  }

  onSubmit() {
    const quoteItems = this.quoteFormGroup.getRawValue();
    const quote_items = quoteItems.quoteItemFormArray
      .map(x => {
        if (x)
          return {
            product_id: x.product.id,
            quantity: x.quantity,
            unit_price: x.unit_price,
            notes: x.notes || '',
          };
        else return null;
      })
      .filter(x => x) as CreateQuoteItemDto[];
    const quote: Partial<CreateQuoteDto> = {
      quote_request_id: this.quoteRequest()?.id,
      buyer_id: this.quoteRequest()?.buyer.id || '',
      seller_message: quoteItems.seller_message || '',
      items: quote_items,
      rfq_id: this.quoteRequest()?.id,
    };
    this.quoteSent.emit(quote);
  }

  search(event: AutoCompleteCompleteEvent) {
    this.filteredProducts = this.products.filter(x =>
      x.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  /** custom form validator for the product field */
  private invalidProduct(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid =
        this.products.some(x => x === control.value) ||
        control.value === this.quoteRequest()?.initial_product;
      return valid ? null : { invalidProduct: { value: control.value } };
    };
  }

  getProductsToSearch() {
    this.productService.getMyProducts({}).subscribe({
      next: res => {
        this.products = res.data;
      },
    });
  }
}
