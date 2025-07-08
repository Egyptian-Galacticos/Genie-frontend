import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-info-card',
  imports: [CommonModule],
  templateUrl: './dashboard-info-card.component.html',
  styleUrl: './dashboard-info-card.component.css',
})
export class DashboardInfoCardComponent {
  cardTitle = input.required<string>();
  cardIconClass = input.required<string>();
  cardDescription = input.required<string>();
  cardFooter = input<string>();
}
