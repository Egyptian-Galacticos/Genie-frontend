import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register-success',
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, DividerModule],
  templateUrl: './register-success.component.html',
})
export class RegisterSuccessComponent {
  readonly environment = environment;
}
