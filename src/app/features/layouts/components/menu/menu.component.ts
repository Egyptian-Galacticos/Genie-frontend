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
                label: 'Customers',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/dashboard/seller/customers'],
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
            ],
          },
        ];
      }
      if (url.find(x => x.path === 'buyer')) {
        console.log('buyer');
      }
    });
  }
}
/**
 *  {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
      },
      {
        label: 'UI Components',
        items: [
          { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
          { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
          {
            label: 'Button',
            icon: 'pi pi-fw pi-mobile',
            class: 'rotated-icon',
            routerLink: ['/uikit/button'],
          },
          { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
          { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
          { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
          { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
          { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
          { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
          { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
          { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
          { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
          { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
          { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
          { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] },
        ],
      },
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        routerLink: ['/pages'],
        items: [
          {
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            routerLink: ['/landing'],
          },
          {
            label: 'Auth',
            icon: 'pi pi-fw pi-user',
            items: [
              {
                label: 'Login',
                icon: 'pi pi-fw pi-sign-in',
                routerLink: ['/auth/login'],
              },
              {
                label: 'Error',
                icon: 'pi pi-fw pi-times-circle',
                routerLink: ['/auth/error'],
              },
              {
                label: 'Access Denied',
                icon: 'pi pi-fw pi-lock',
                routerLink: ['/auth/access'],
              },
            ],
          },
          {
            label: 'Crud',
            icon: 'pi pi-fw pi-pencil',
            routerLink: ['/pages/crud'],
          },
          {
            label: 'Not Found',
            icon: 'pi pi-fw pi-exclamation-circle',
            routerLink: ['/pages/notfound'],
          },
          {
            label: 'Empty',
            icon: 'pi pi-fw pi-circle-off',
            routerLink: ['/pages/empty'],
          },
        ],
      },
      {
        label: 'Hierarchy',
        items: [
          {
            label: 'Submenu 1',
            icon: 'pi pi-fw pi-bookmark',
            items: [
              {
                label: 'Submenu 1.1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                  { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
                ],
              },
              {
                label: 'Submenu 1.2',
                icon: 'pi pi-fw pi-bookmark',
                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }],
              },
            ],
          },
          {
            label: 'Submenu 2',
            icon: 'pi pi-fw pi-bookmark',
            items: [
              {
                label: 'Submenu 2.1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                  { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                  { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
                ],
              },
              {
                label: 'Submenu 2.2',
                icon: 'pi pi-fw pi-bookmark',
                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }],
              },
            ],
          },
        ],
      },
      {
        label: 'Get Started',
        items: [
          {
            label: 'Documentation',
            icon: 'pi pi-fw pi-book',
            routerLink: ['/documentation'],
          },
          {
            label: 'View Source',
            icon: 'pi pi-fw pi-github',
            url: 'https://github.com/primefaces/sakai-ng',
            target: '_blank',
          },
        ],
      },
 */
