import { Component, input, output, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
  ],
})
export class ProductSearchComponent {
  searchValue = input<string>('');
  loading = input<boolean>(false);
  searchChange = output<string>();

  protected localSearchValue = linkedSignal(() => this.searchValue() || '');
  private searchTimeout?: ReturnType<typeof setTimeout>;

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.localSearchValue.set(value);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.searchChange.emit(value);
    }, 500);
  }

  clearSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.localSearchValue.set('');
    this.searchChange.emit('');
  }
}
