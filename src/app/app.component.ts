import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  themeService = inject(ThemeService);
  private webSocketService = inject(WebSocketService);

  async ngOnInit(): Promise<void> {
    await this.webSocketService.initialize();
  }
}
