import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { MenuItemComponent } from './../menu-item/menu-item.component';

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
      if (url.find(x => x.path === 'seller')) {
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
                    icon: 'pi pi-fw pi-inbox',
                    routerLink: ['/dashboard/seller/quotes-requests'],
                  },
                  {
                    label: 'Responses',
                    icon: 'pi pi-fw pi-send',
                    routerLink: ['/dashboard/seller/quotes-responses'],
                  },
                ],
              },
              // {
              //   label: 'Contracts',
              //   icon: 'pi pi-fw pi-paperclip',
              //   items: [
              //     {
              //       label: 'All Contracts',
              //       icon: 'pi pi-fw pi-paperclip',
              //       routerLink: ['/dashboard/seller/contracts'],
              //     },
              //   ],
              // },
              {
                label: 'Chat',
                icon: 'pi pi-fw pi-comments',
                routerLink: ['/dashboard/seller/chat'],
              },
            ],
          },
        ];
      }
      if (url.find(x => x.path === 'buyer')) {
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
              {
                label: 'Chat',
                icon: 'pi pi-fw pi-comments',
                routerLink: ['/dashboard/buyer/chat'],
              },
            ],
          },
        ];
      }
      if (url.find(x => x.path === 'admin')) {
        this.items = [
          {
            label: 'Admin Dashboard',
            items: [
              {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/dashboard/admin'],
              },
              {
                label: 'Users',
                icon: 'pi pi-fw pi-users',
                items: [
                  {
                    label: 'Pending Users',
                    icon: 'pi pi-fw pi-user-plus',
                    routerLink: ['/dashboard/admin/pending-users'],
                  },
                ],
              },
              {
                label: 'Products',
                icon: 'pi pi-fw pi-box',
                items: [
                  {
                    label: 'Pending Products',
                    icon: 'pi pi-fw pi-clock',
                    routerLink: ['/dashboard/admin/pending-products'],
                  },
                ],
              },
              {
                label: 'Categories',
                icon: 'pi pi-fw pi-tags',
                items: [
                  {
                    label: 'Pending Categories',
                    icon: 'pi pi-fw pi-tag',
                    routerLink: ['/dashboard/admin/pending-categories'],
                  },
                ],
              },
              {
                label: 'Orders',
                icon: 'pi pi-fw pi-shopping-cart',
                routerLink: ['/dashboard/admin/orders'],
              },
            ],
          },
        ];
      }
    });
  }
}
