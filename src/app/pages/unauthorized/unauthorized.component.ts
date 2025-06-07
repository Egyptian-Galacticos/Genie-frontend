import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule, RouterModule, ButtonModule, MessageModule],
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
