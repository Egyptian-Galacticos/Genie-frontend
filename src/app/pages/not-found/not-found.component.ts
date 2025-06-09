import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterModule, ButtonModule, MessageModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  private location = inject(Location);

  readonly environment = environment;

  goBack(): void {
    this.location.back();
  }
}
