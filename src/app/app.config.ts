import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes, withComponentInputBinding()),
		provideHttpClient(withFetch()),
		provideClientHydration(withEventReplay()),
		provideAnimations(),
		provideTranslateService({
			fallbackLang: 'es',
			loader: provideTranslateHttpLoader({
				prefix: '/assets/i18n/',
				suffix: '.json',
			}),
		}),
	],
};
