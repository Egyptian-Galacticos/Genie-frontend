import { Component, input, model, output } from '@angular/core';
import { CreateProductDto, ProductWithErrors } from '../../../../shared/utils/interfaces';
import { TableModule } from 'primeng/table';
import { SlicePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { InplaceModule } from 'primeng/inplace';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { EditProductComponent } from '../edit-product/edit-product.component';

@Component({
  selector: 'app-review-products',
  templateUrl: './review-products.component.html',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    InplaceModule,
    FormsModule,
    ButtonModule,
    SlicePipe,
    DrawerModule,
    EditProductComponent,
  ],
})
export class ReviewProductsComponent {
  products = input.required<ProductWithErrors[]>();
  validProducts = input.required<CreateProductDto[]>();
  invalidProducts = input.required<ProductWithErrors[]>();
  isLoading = model.required<boolean>();
  activeStep = input.required<number>();
  editingProduct = input<ProductWithErrors | null>(null);
  editDrawerVisible = input<boolean>(false);

  productsChange = output<ProductWithErrors[]>();
  validProductsChange = output<CreateProductDto[]>();
  invalidProductsChange = output<ProductWithErrors[]>();
  isLoadingChange = output<boolean>();
  activeStepChange = output<number>();
  submitValidProducts = output<void>();
  resetForm = output<void>();
  closeEditDrawer = output<void>();
  handleProductEdited = output<ProductWithErrors>();
  openEditDrawer = output<ProductWithErrors>();

  editProduct(product: ProductWithErrors) {
    this.openEditDrawer.emit(product);
  }

  removeInvalidProduct(index: number) {
    const updated = [...this.invalidProducts()];
    updated.splice(index, 1);
    this.invalidProductsChange.emit(updated);
  }

  goBackToUpload() {
    this.activeStepChange.emit(1);
  }

  reset() {
    this.resetForm.emit();
  }

  submitProducts() {
    this.submitValidProducts.emit();
  }

  onCloseEditDrawer() {
    this.closeEditDrawer.emit();
  }

  onProductEdited(product: ProductWithErrors) {
    this.handleProductEdited.emit(product);
  }
  isCorrectable(product: ProductWithErrors): boolean {
    return (
      product.errors != undefined &&
      (product.errors.findIndex(x => x.includes('main_image')) !== -1 ||
        product.errors.findIndex(x => x.includes('category')) !== -1)
    );
  }
}
