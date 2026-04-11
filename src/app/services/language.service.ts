import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * LanguageService - Handles app language with TMDB support
 * Uses ngx-translate v17 API
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
	private platformId = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.platformId);
	private translate = inject(TranslateService);

	// Supported languages for TMDB
	static readonly TMDB_LANGUAGES: Record<string, string> = {
		es: 'es-ES',
		en: 'en-US',
	};

	// Default language
	private defaultLang = 'es';

	// Signal for current language
	languageSignal = signal<string>(this.defaultLang);

	constructor() {
		// Load saved language or detect browser language
		if (this.isBrowser) {
			const savedLang = localStorage.getItem('language') as string | null;
			if (savedLang && LanguageService.TMDB_LANGUAGES[savedLang]) {
				this.defaultLang = savedLang;
			} else {
				// Detect from browser
				const browserLang = navigator.language.split('-')[0];
				if (LanguageService.TMDB_LANGUAGES[browserLang]) {
					this.defaultLang = browserLang;
				}
			}
		}

		// Register available languages
		this.translate.addLangs(['es', 'en']);

		// Set fallback language in ngx-translate v17
		this.translate.setFallbackLang(this.defaultLang);
		this.translate.setDefaultLang(this.defaultLang); // Backwards compatibility
		this.languageSignal.set(this.defaultLang);
	}

	// Get TMDB language code (e.g., 'es-ES')
	getTmdbLanguage(): string {
		return LanguageService.TMDB_LANGUAGES[this.languageSignal()] || 'es-ES';
	}

	// Get current app language code (e.g., 'es')
	getLanguage(): string {
		return this.languageSignal();
	}

	// Switch language
	setLanguage(lang: string): void {
		if (!LanguageService.TMDB_LANGUAGES[lang]) {
			return;
		}

		this.languageSignal.set(lang);
		this.translate.use(lang);

		if (this.isBrowser) {
			localStorage.setItem('language', lang);
		}
	}

	// Get available languages for UI dropdown
	getAvailableLanguages(): { code: string; name: string }[] {
		return [
			{ code: 'es', name: 'Español' },
			{ code: 'en', name: 'English' },
		];
	}
}
