import { Component, input, output, linkedSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

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
    TooltipModule,
  ],
})
export class ProductSearchComponent {
  searchValue = input<string>('');
  loading = input<boolean>(false);
  searchChange = output<string>();
  aiSearchChange = output<string>();

  protected localSearchValue = linkedSignal(() => this.searchValue() || '');
  protected isAiMode = signal(false);
  private searchTimeout?: ReturnType<typeof setTimeout>;

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.localSearchValue.set(value);

    if (!this.isAiMode()) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.searchChange.emit(value);
      }, 500);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.performSearch();
    }
  }

  performSearch(): void {
    const currentValue = this.localSearchValue().trim();

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.isAiMode()) {
      this.aiSearchChange.emit(currentValue);
    } else {
      this.searchChange.emit(currentValue);
    }
  }

  toggleAiMode(): void {
    this.isAiMode.update(current => !current);

    const currentValue = this.localSearchValue();
    if (currentValue.trim()) {
      this.performSearch();
    }
  }

  clearSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.localSearchValue.set('');

    if (this.isAiMode()) {
      this.aiSearchChange.emit('');
    } else {
      this.searchChange.emit('');
    }
  }
}
