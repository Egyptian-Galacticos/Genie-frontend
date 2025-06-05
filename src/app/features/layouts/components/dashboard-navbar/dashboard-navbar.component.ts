import { ThemeService } from '../../../../core/services/theme.service';
import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [NgClass, ButtonModule],
  templateUrl: './dashboard-navbar.component.html',
  // styleUrl: '../../styles/_topbar.scss',
})
export class DashboardNavbarComponent {
  public layoutService = inject(LayoutService);
  public themeService = inject(ThemeService);
  toggleDarkMode() {
    // this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
    this.themeService.setTheme(!this.themeService.isDark());
  }
}
