import { InplaceModule } from 'primeng/inplace';
import { TagModule } from 'primeng/tag';
import { StepperModule } from 'primeng/stepper';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { Component, inject, model, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  Category,
  CreateProductDto,
  ExcelRow,
  IPriceTier,
  ProductWithErrors,
} from '../../shared/utils/interfaces';
import { downloadTemplate } from './utils/Exceltemplate';
import { isValidUrl, parseBoolean, parseNumber } from './utils/HelperFunctions';
import { ReviewProductsComponent } from './components/review-productss/review-products.component';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService } from '../../shared/services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  imports: [
    StepperModule,
    TableModule,
    TagModule,
    InplaceModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    FileUploadModule,
    NgClass,
    ReviewProductsComponent,
  ],
  providers: [MessageService],
})
export class BulkUploadComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  messageService = inject(MessageService);
  router = inject(Router);

  activeStep = model<number>(1);
  products = model<ProductWithErrors[]>([]);
  isLoading = model<boolean>(false);
  validProducts = model<CreateProductDto[]>([]);
  invalidProducts = model<ProductWithErrors[]>([]);

  editingProduct = signal<ProductWithErrors | null>(null);
  editDrawerVisible = signal<boolean>(false);

  levelTwoCategories: Category[] = [];
  get activeStepValue() {
    return this.activeStep() || 1;
  }

  set activeStepValue(value: number) {
    this.activeStep.set(value);
  }
  ngOnInit() {
    this.resetForm();
    this.categoryService.getCategories().subscribe({
      next: response => {
        response.forEach(cat =>
          cat.children.forEach(cat2 =>
            cat2.children.forEach(cat3 => this.levelTwoCategories.push(cat3))
          )
        );
      },
    });
  }
  // Required fields for validation
  requiredFields = [
    'name',
    'description',
    'currency',
    'origin',
    'sku',
    'weight',
    'dimensions.length',
    'dimensions.width',
    'dimensions.height',
    'main_image',
    'category_id',
  ];

  downloadTemplate() {
    const level2Cats: Category[] = [];
    this.categoryService.getCategories().subscribe({
      next: response => {
        response.forEach(cat => {
          cat.children.forEach(cat2 => cat2.children.forEach(cat3 => level2Cats.push(cat3)));
        });
        downloadTemplate(level2Cats);
      },
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Template Downloaded',
      detail: 'Product template has been downloaded successfully',
    });
  }

  onFileSelect(event: FileSelectEvent) {
    const file = event.files[0];
    if (!file) return;

    this.isLoading.set(true);
    this.products.set([]);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target || e.target?.result === null) throw new Error('Failed to read file');
        if (!(e.target.result instanceof ArrayBuffer)) throw new Error('Invalid file format');

        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { raw: false });

        this.processUploadedData(jsonData);
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Processing Error',
          detail: 'Error processing the uploaded file. Please check the format.',
        });
        this.isLoading.set(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  private processUploadedData(data: ExcelRow[]) {
    const processedProducts = data.map((row, index) => {
      const product: ProductWithErrors = this.transformRowToProduct(row);
      product.rowIndex = index + 2; // +2 because Excel starts at 1 and has header row
      product.errors = this.validateProduct(product, data);
      return product;
    });

    this.products.set(processedProducts);
    this.invalidProducts.set(
      processedProducts.filter(product => product.errors && product.errors.length > 0)
    );
    this.validProducts.set(
      processedProducts.filter(product => !product.errors || product.errors.length === 0)
    );
    this.isLoading.set(false);

    this.messageService.add({
      severity: 'info',
      summary: 'File Processed',
      detail: `Found ${this.products().length} products. ${this.validProducts().length} valid, ${this.invalidProducts().length} invalid.`,
    });
  }

  private transformRowToProduct(row: ExcelRow): ProductWithErrors {
    // Parse price tiers from flattened structure
    const priceTiers: IPriceTier[] = [];
    let tierIndex = 0;
    while (row[`price_tiers.${tierIndex}.from_quantity`] !== undefined) {
      const tier: IPriceTier = {
        from_quantity: parseNumber(row[`price_tiers.${tierIndex}.from_quantity`]),
        to_quantity: parseNumber(row[`price_tiers.${tierIndex}.to_quantity`]),
        price: parseNumber(row[`price_tiers.${tierIndex}.price`]),
      };
      if (tier.from_quantity !== null || tier.to_quantity !== null || tier.price !== null) {
        priceTiers.push(tier);
      }
      tierIndex++;
    }

    return {
      name: row.name?.toString().trim() || '',
      description: row.description?.toString().trim() || '',
      currency: row.currency?.toString().trim() || 'USD',
      origin: row.origin?.toString().trim() || '',
      sku: row.sku?.toString().trim() || '',
      weight: parseNumber(row.weight) || 0,
      category_id: parseNumber(row.category_id) || 0,

      dimensions: {
        length: parseNumber(row['dimensions.length']) || 0,
        width: parseNumber(row['dimensions.width']) || 0,
        height: parseNumber(row['dimensions.height']) || 0,
      },
      main_image: row.main_image?.toString().trim() || '',
      brand: row.brand?.toString().trim() || undefined,
      model_number: row.model_number?.toString().trim() || undefined,
      hs_code: row.hs_code?.toString().trim() || undefined,
      sample_available: parseBoolean(row.sample_available),
      sample_price: parseNumber(row.sample_price) || undefined,
      product_tags: row['tags']
        ? row['tags']
            .toString()
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : undefined,
      images: row.images
        ? row.images
            .toString()
            .split(',')
            .map((i: string) => i.trim())
            .filter((i: string) => i)
        : undefined,
      documents: row.documents
        ? row.documents
            .toString()
            .split(',')
            .map((d: string) => d.trim())
            .filter((d: string) => d)
        : undefined,
      specifications: row.specifications
        ? row.specifications
            .toString()
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s)
        : undefined,
      price_tiers: priceTiers.length > 0 ? priceTiers : null,
    };
  }

  private validateProduct(product: ProductWithErrors, allData: ExcelRow[]): string[] {
    const errors: string[] = [];

    // Required field validation
    if (!product.name) errors.push('Name is required');
    if (!product.description) errors.push('Description is required');
    if (!product.currency) errors.push('Currency is required');
    if (!product.origin) errors.push('Origin is required');
    if (!product.sku) errors.push('SKU is required');
    if (!product.weight || product.weight <= 0) errors.push('Valid weight is required');
    if (!product.main_image) errors.push('Main image URL is required');
    if (!product.price_tiers || product.price_tiers.length <= 0)
      errors.push('At least one price tier is required');
    // Dimensions validation
    if (!product.dimensions.length || product.dimensions.length <= 0) {
      errors.push('Valid length dimension is required');
    }
    if (!product.dimensions.width || product.dimensions.width <= 0) {
      errors.push('Valid width dimension is required');
    }
    if (!product.dimensions.height || product.dimensions.height <= 0) {
      errors.push('Valid height dimension is required');
    }

    // URL validation for images
    if (product.main_image && !isValidUrl(product.main_image)) {
      errors.push('Main image must be a valid URL');
    }

    // SKU uniqueness check within the uploaded data
    const duplicateSku = allData.filter(row => row.sku?.toString().trim() === product.sku);
    if (duplicateSku.length > 1) {
      errors.push('SKU must be unique');
    }

    // Price tiers validation
    if (product.price_tiers && product.price_tiers.length > 0) {
      product.price_tiers.forEach((tier, index) => {
        if (tier.price !== null && tier.price <= 0) {
          errors.push(`Price tier ${index + 1}: Price must be greater than 0`);
        }
        if (
          tier.from_quantity !== null &&
          tier.to_quantity !== null &&
          tier.from_quantity >= tier.to_quantity
        ) {
          errors.push(`Price tier ${index + 1}: From quantity must be less than to quantity`);
        }
      });
    }
    if (!this.levelTwoCategories.find(x => x.id === product.category_id))
      errors.push(`wrong category Id `);
    return errors;
  }

  editProduct(product: ProductWithErrors) {
    // Find the product in the array and update it
    this.products.update(products => {
      const index = products.findIndex(
        p => p.sku === product.sku && p.rowIndex === product.rowIndex
      );
      if (index !== -1) {
        // Re-validate after editing
        product.errors = this.validateProduct(
          product,
          products.map(
            p =>
              ({
                name: p.name,
                description: p.description,
                currency: p.currency,
                origin: p.origin,
                sku: p.sku,
                weight: p.weight,
                'dimensions.length': p.dimensions.length,
                'dimensions.width': p.dimensions.width,
                'dimensions.height': p.dimensions.height,
                main_image: p.main_image,
                brand: p.brand,
                model_number: p.model_number,
                hs_code: p.hs_code,
                sample_available: p.sample_available,
                sample_price: p.sample_price,
                product_tags: p.product_tags?.join(','),
                images: p.images?.join(','),
                documents: p.documents?.join(','),
                specifications: p.specifications?.join(','),
              }) as ExcelRow
          )
        );

        products[index] = product;
      }
      return products;
    });
  }

  removeInvalidProduct(index: number) {
    this.products.update(products => {
      const invalidProduct = this.invalidProducts()[index];
      if (invalidProduct) {
        const productIndex = products.findIndex(
          p => p.sku === invalidProduct.sku && p.rowIndex === invalidProduct.rowIndex
        );
        if (productIndex !== -1) {
          products.splice(productIndex, 1);
        }
      }
      return [...products];
    });
  }

  resetForm() {
    this.activeStep.set(1);
    this.products.set([]);
    this.isLoading.set(false);
    this.invalidProducts.set([]);
    this.validProducts.set([]);
  }

  openEditDrawer(product: ProductWithErrors) {
    this.editingProduct.set(product);
    this.editDrawerVisible.set(true);
  }

  closeEditDrawer() {
    this.editDrawerVisible.set(false);
    this.editingProduct.set(null);
  }

  handleProductEdited(editedProduct: ProductWithErrors) {
    // Re-validate the edited product
    const mockExcelData = this.products().map(
      p =>
        ({
          name: p.name,
          sku: p.sku,
          description: p.description,
          currency: p.currency,
          origin: p.origin,
          weight: p.weight,
          category_id: p.category_id,
          'dimensions.length': p.dimensions.length,
          'dimensions.width': p.dimensions.width,
          'dimensions.height': p.dimensions.height,
          main_image: p.main_image,
        }) as ExcelRow
    );
    console.log('Mock Excel Data:', mockExcelData);
    const revalidatedProduct = {
      ...editedProduct,
      errors: this.validateProduct(editedProduct, mockExcelData),
    };

    // Update the product in the products array
    this.products.update(products => {
      const index = products.findIndex(p => p.rowIndex === revalidatedProduct.rowIndex);
      if (index !== -1) {
        products[index] = revalidatedProduct;
      }
      return [...products];
    });

    // Update valid/invalid arrays
    this.updateProductArrays();
    this.closeEditDrawer();

    this.messageService.add({
      severity: 'success',
      summary: 'Product Updated',
      detail: 'Product has been successfully updated and revalidated.',
    });
  }

  private updateProductArrays() {
    const allProducts = this.products();
    this.validProducts.set(
      allProducts
        .filter(product => !product.errors || product.errors.length === 0)
        .map(product => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { errors, rowIndex, ...cleanProduct } = product;
          return cleanProduct as CreateProductDto;
        })
    );
    this.invalidProducts.set(
      allProducts.filter(product => product.errors && product.errors.length > 0)
    );
  }

  async submitProducts() {
    if (this.validProducts().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Valid Products',
        detail: 'Please ensure you have valid products before submitting.',
      });
      return;
    }

    this.isLoading.set(true);

    try {
      console.log(this.validProducts());
      this.isLoading.set(true);
      this.productService.UploadBulk(this.validProducts()).subscribe({
        next: response => {
          this.messageService.add({
            severity: 'success',
            summary: 'Products Submitted',
            detail: `Successfully submitted ${this.validProducts().length} products.`,
          });
          console.log(response);
          this.isLoading.set(false);
          this.router.navigate(['/dashboard/seller/products']);
        },
        error: error => {
          this.messageService.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: 'Failed to submit products. Please try again.',
          });
          console.error(error);
          this.isLoading.set(false);
        },
      });
      // Reset form after successful submission
      // this.resetForm();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Submission Failed',
        detail: 'Failed to submit products. Please try again.',
      });
      this.isLoading.set(false);
    }
  }
}
