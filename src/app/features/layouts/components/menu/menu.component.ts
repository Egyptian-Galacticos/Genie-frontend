import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [MenuItemComponent],
  templateUrl: './menu.component.html',
  // styleUrl: '../../styles/_menu.scss',
})
export class MenuComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  items: MenuItem[] = [];
  ngOnInit() {
    this.activatedRoute.url.subscribe(url => {
      // console.log(url);
      if (url.find(x => x.path === 'seller')) {
        console.log('seller');
        this.items = [
          {
            label: 'Seller Dashboard',
            items: [
              {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/dashboard/seller'],
              },
              {
                label: 'Products',
                icon: 'pi pi-fw pi-box',
                items: [
                  {
                    label: 'All Products',
                    icon: 'pi pi-fw pi-box',
                    routerLink: ['/dashboard/seller/products'],
                  },
                  {
                    label: 'Add Product',
                    icon: 'pi pi-fw pi-plus',
                    routerLink: ['/dashboard/seller/products/add'],
                  },
                  {
                    label: 'Bulk Upload',
                    icon: 'pi pi-fw pi-upload',
                    routerLink: ['/dashboard/seller/products/bulk-upload'],
                  },
                ],
              },
              {
                label: 'Quotes',
                icon: 'pi pi-fw pi-receipt',
                items: [
                  {
                    label: 'Requests',
                    icon: 'pi pi-fw pi-receipt',
                    routerLink: ['/dashboard/seller/quotes-requests'],
                  },
                  {
                    label: 'Quotes',
                    icon: 'pi pi-fw pi-receipt',
                    routerLink: ['/dashboard/seller/quotes'],
                  },
                ],
              },
              {
                label: 'Customers',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/dashboard/seller/customers'],
              },
              {
                label: 'Contracts',
                icon: 'pi pi-fw pi-paperclip',
                items: [
                  {
                    label: 'All Contracts',
                    icon: 'pi pi-fw pi-paperclip',
                    routerLink: ['/dashboard/seller/contracts'],
                  },
                ],
              },
            ],
          },
        ];
      }
      if (url.find(x => x.path === 'buyer')) {
        console.log('buyer');
        this.items = [
          {
            label: 'Buyer Dashboard',
            items: [
              {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/dashboard/buyer'],
              },
              {
                label: 'Wishlist',
                icon: 'pi pi-fw pi-heart',
                routerLink: ['/dashboard/buyer/wishlist'],
              },
              {
                label: 'Quotes',
                icon: 'pi pi-fw pi-receipt',
                items: [
                  {
                    label: 'Responses',
                    icon: 'pi pi-fw pi-inbox',
                    routerLink: ['/dashboard/buyer/quotes-responses'],
                  },
                  {
                    label: 'Requests',
                    icon: 'pi pi-fw pi-send',
                    routerLink: ['/dashboard/buyer/quotes-requests'],
                  },
                ],
              },
            ],
          },
        ];
      }
    });
  }
}
