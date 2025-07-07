import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';

interface BreadcrumbItem {
  label: string;
  routerLink?: string;
  icon?: string;
  disabled?: boolean;
}

interface BreadcrumbHome {
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-product-breadcrumb',
  templateUrl: './product-breadcrumb.component.html',
  imports: [CommonModule, BreadcrumbModule],
})
export class ProductBreadcrumbComponent {
  breadcrumbItems = input<BreadcrumbItem[]>([]);
  breadcrumbHome = input<BreadcrumbHome>({
    icon: 'pi pi-home',
    routerLink: '/',
  });
}
