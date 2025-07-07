import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../../../interfaces/product.interface';

interface ProductSpec {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-tabs',
  templateUrl: './product-tabs.component.html',
  imports: [CommonModule, CardModule, TabsModule, TableModule, ButtonModule],
})
export class ProductTabsComponent {
  product = input<Product | null>(null);
  productSpecs = input<ProductSpec[]>([]);
  activeTab = input<number>(0);

  tabChange = output<{ index: number }>();
  downloadDocument = output<string>();

  getCertificationsTabValue = computed(() => {
    const product = this.product();
    if (!product) return '0';

    let tabValue = 2;

    if (product.specifications && product.specifications.length > 0) {
      tabValue++;
    }

    return tabValue.toString();
  });

  getDocumentsTabValue = computed(() => {
    const product = this.product();
    if (!product) return '0';

    let tabValue = 2;
    if (product.specifications && product.specifications.length > 0) {
      tabValue++;
    }

    if (product.certifications && product.certifications.length > 0) {
      tabValue++;
    }

    return tabValue.toString();
  });

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'pi pi-file';

    const type = mimeType.toLowerCase();
    if (type.includes('pdf')) return 'pi pi-file-pdf';
    if (type.includes('word') || type.includes('document') || type.includes('doc'))
      return 'pi pi-file-word';
    if (
      type.includes('excel') ||
      type.includes('spreadsheet') ||
      type.includes('csv') ||
      type.includes('xlsx')
    )
      return 'pi pi-file-excel';
    return 'pi pi-file';
  }

  getFileColor(mimeType: string): string {
    if (!mimeType) return 'text-gray-500';

    const type = mimeType.toLowerCase();
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('word') || type.includes('document') || type.includes('doc'))
      return 'text-blue-500';
    if (
      type.includes('excel') ||
      type.includes('spreadsheet') ||
      type.includes('csv') ||
      type.includes('xlsx')
    )
      return 'text-green-500';
    return 'text-gray-500';
  }

  onTabChange(event: Event) {
    const target = event.target as HTMLElement;
    const value = target?.getAttribute('value') || '0';
    const index = parseInt(value);
    this.tabChange.emit({ index });
  }

  onDownloadDocument(url: string) {
    if (!url || url.trim() === '') {
      console.warn('Invalid download URL provided');
      return;
    }
    this.downloadDocument.emit(url);
  }
}
