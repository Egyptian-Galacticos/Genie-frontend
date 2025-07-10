import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Product } from '../../../../interfaces/product.interface';

interface PricingDisplay {
  hasPrice: boolean;
  price?: string;
  currency: string;
  isVolumePricing?: boolean;
  minQuantity?: number;
}

interface CompanyInfo {
  name: string;
  logo?: { url: string };
  address?: {
    city: string;
    country: string;
  };
  website?: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.component.html',
  imports: [
    CommonModule,
    ChipModule,
    TagModule,
    CardModule,
    DividerModule,
    ButtonModule,
    AvatarModule,
  ],
})
export class ProductInfoComponent {
  product = input<Product | null>(null);
  pricingDisplay = input<PricingDisplay | null>(null);
  companyInfo = input<CompanyInfo | null>(null);
  wishlistLoading = input<boolean>(false);
  canPerformBuyerActions = input<boolean>(false);
  isProductOwner = input<boolean>(false);

  requestQuote = output<void>();
  wishlistToggle = output<void>();
}
