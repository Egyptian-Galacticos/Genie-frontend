import { NgClass } from '@angular/common';
import { LayoutService } from './../../services/layout.service';
import { Component, HostBinding, inject, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-menu-item',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './menu-item.component.html',
  // styleUrl: '../../styles/_menu.scss',
  animations: [
    trigger('children', [
      state(
        'collapsed',
        style({
          height: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
})
export class MenuItemComponent {
  private layoutService = inject(LayoutService);
  item = input.required<MenuItem>();
  index = input.required<number>();
  root = input<boolean>();
  active = false;
  parentKey = input<string>();
  key: string = '';
  @HostBinding('class.layout-root-menuitem') get isRoot() {
    return this.root();
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item().disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item().command) {
      this.item().command ? { originalEvent: event, item: this.item } : undefined;
    }

    // toggle active state
    if (this.item().items) {
      this.active = !this.active;
    }

    this.layoutService.onMenuStateChange({ key: this.key });
  }
  get submenuAnimation() {
    return this.root() ? 'expanded' : this.active ? 'expanded' : 'collapsed';
  }
}
