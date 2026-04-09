import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type Theme = 'light' | 'dark';

/**
 * ThemeService — Global theme management
 * Handles light/dark mode toggling with localStorage persistence
 * Uses signals for reactive state updates across the app
 */
@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private platformId = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.platformId);

	// Signal: current theme
	private themeSignal = signal<Theme>('light');

	// Public accessor for theme
	theme = this.themeSignal.asReadonly();

	constructor() {
		// Load saved theme from localStorage or system preference
		// Only in browser environment (SSR safe)
		if (this.isBrowser) {
			const savedTheme = this.getSavedTheme();
			this.themeSignal.set(savedTheme);
		}

		// Effect: apply theme to DOM whenever signal changes
		effect(() => {
			const theme = this.themeSignal();
			if (this.isBrowser) {
				this.applyTheme(theme);
			}
		});
	}

	/**
	 * Toggle between light and dark theme
	 */
	toggleTheme(): void {
		const current = this.themeSignal();
		const next = current === 'light' ? 'dark' : 'light';
		this.themeSignal.set(next);

		if (this.isBrowser) {
			localStorage.setItem('theme', next);
		}
	}

	/**
	 * Get saved theme from localStorage or system preference
	 */
	private getSavedTheme(): Theme {
		if (!this.isBrowser) {
			return 'light';
		}

		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved && ['light', 'dark'].includes(saved)) {
			return saved;
		}

		// Fallback: check system preference
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}

		return 'light';
	}

	/**
	 * Apply theme to document root
	 */
	private applyTheme(theme: Theme): void {
		if (!this.isBrowser) {
			return;
		}

		const root = document.documentElement;

		// Set data-theme attribute (used by our CSS variables)
		root.setAttribute('data-theme', theme);

		// Remove old classes and add new one (for Tailwind's dark mode)
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
	}

	/**
	 * Check if current theme is dark
	 */
	isDark(): boolean {
		return this.themeSignal() === 'dark';
	}
}
