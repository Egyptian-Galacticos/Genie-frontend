import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideNoopAnimations(), // Use noop animations for SSR to prevent issues
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
