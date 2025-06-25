import { ProductService } from '../../../../../shared/services/product.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-sample-and-tags',
  imports: [
    ReactiveFormsModule,
    DividerModule,
    AutoCompleteModule,
    InputNumberModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './product-sample-and-tags.component.html',
})
export class ProductSampleAndTagsComponent implements OnInit {
  productService = inject(ProductService);
  messageService = inject(MessageService);
  productFormGroup = input.required<FormGroup>();
  loading = input.required<boolean>();
  update = input<boolean>(false);
  get selectedTags() {
    return this.productFormGroup().get('tags')?.value || [];
  }

  ngOnInit() {
    this.loadAllTags();
  }
  // Tags
  tagInputControl = new FormControl('');
  tags: string[] = ['electronics', 'gadget', 'wireless', 'smartphone', 'audio'];
  filteredTags: string[] = [];
  filterTags(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    this.filteredTags = this.tags.filter(
      tag => tag.toLowerCase().includes(query) && !this.selectedTags.includes(tag)
    );
  }

  addTag(tag: string) {
    if (tag && !this.selectedTags.includes(tag)) {
      const updatedTags = [...this.selectedTags, tag];
      this.productFormGroup().get('tags')?.setValue(updatedTags);
      this.productFormGroup().get('tags')?.markAsTouched();
    }
    this.tagInputControl.setValue('');
  }

  onTagKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const tag = this.tagInputControl.value?.trim();
      if (tag && !this.selectedTags.includes(tag)) {
        this.addTag(tag);
      } else {
        this.tagInputControl.setValue('');
      }
    }
  }

  removeTag(index: number) {
    const updated = [...this.selectedTags];
    updated.splice(index, 1);
    this.productFormGroup().get('tags')?.setValue(updated);
  }

  // Get Tags
  loadAllTags() {
    return this.productService.getAllTags().subscribe({
      next: response => {
        this.tags = response.data;
      },
      error: error => {
        this.showError(error.message);
      },
    });
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
}
