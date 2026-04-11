import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../services/theme.service';
import { LanguageService } from '../services/language.service';

/**
 * AppHeader — Navigation bar with theme toggle
 * Shows branding, navigation links, and dark/light mode toggle
 */
@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
	template: `
		<header class="sticky top-0 z-100 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 py-4 shadow-md">
			<div class="max-w-[1400px] mx-auto px-8 flex items-center justify-between gap-8">
				<!-- Logo / Brand -->
				<div class="flex-shrink-0 animate-slide-down">
					<a [routerLink]="['/']" class="no-underline">
						<h1 class="text-3xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors m-0">
							🎬
						</h1>
					</a>
				</div>

				<!-- Navigation -->
				<nav aria-label="Main navigation" class="flex gap-8 items-center flex-1">
					<a [routerLink]="['/', 'movies']" 
						routerLinkActive="active"
						[attr.aria-current]="isActive(['/', 'movies']) ? 'page' : null"
						class="nav-link"
					>{{ 'NAV.MOVIES' | translate }}</a>
					<a [routerLink]="['/', 'favorites']" 
						routerLinkActive="active"
						[attr.aria-current]="isActive(['/', 'favorites']) ? 'page' : null"
						class="nav-link"
					>{{ 'NAV.FAVORITES' | translate }}</a>
				</nav>

<!-- Language Selector -->
			<select
				(change)="changeLanguage($any($event.target).value)"
				[attr.aria-label]="'Select language'"
				class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 cursor-pointer text-sm font-medium"
			>
				@for (lang of availableLanguages(); track lang.code) {
					<option [value]="lang.code" [selected]="lang.code === currentLanguage()">
						{{ lang.name }}
					</option>
				}
			</select>

<!-- Theme Toggle -->
			<button
				(click)="toggleTheme($event)"
				[attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
				class="w-11 h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xl cursor-pointer flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 flex-shrink-0 animate-slide-down"
				[title]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
			>
					<i class="ph text-xl" [class.ph-sun]="isDark()" [class.ph-moon]="!isDark()" [class.text-yellow-500]="isDark()" [class.text-gray-600]="!isDark()" aria-hidden="true"></i>
				</button>
			</div>
		</header>
	`,
	styles: `
		@keyframes slideDown {
			from {
				opacity: 0;
				transform: translateY(-10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		.animate-slide-down {
			animation: slideDown 0.5s ease-out;
		}
		.nav-link {
			color: var(--color-text-secondary);
			text-decoration: none;
			font-weight: 500;
			transition: color 0.2s ease;
			cursor: pointer;
		}
		.nav-link:hover,
		.nav-link.active {
			color: var(--color-accent);
		}
		.nav-link.active {
			border-bottom: 2px solid var(--color-accent);
			padding-bottom: 0.25rem;
		}
		@media (max-width: 768px) {
			:host ::ng-deep .max-w-\\[1400px\\] {
				padding-left: 1rem !important;
				padding-right: 1rem !important;
				gap: 1rem !important;
			}
			:host ::ng-deep .text-2xl {
				font-size: 1.2rem !important;
			}
			:host ::ng-deep .flex-gap-8 {
				gap: 1rem !important;
				font-size: 0.9rem !important;
			}
		}
	`,
})
export class AppHeaderComponent {
	private readonly themeService = inject(ThemeService);
	private readonly languageService = inject(LanguageService);
	private readonly router = inject(Router);

	// Language methods
	availableLanguages(): { code: string; name: string }[] {
		return this.languageService.getAvailableLanguages();
	}

	currentLanguage(): string {
		return this.languageService.getLanguage();
	}

	changeLanguage(lang: string): void {
		this.languageService.setLanguage(lang);
	}

	toggleTheme(event: MouseEvent): void {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;
		this.themeService.toggleTheme({ x, y });
	}

	isDark(): boolean {
		return this.themeService.isDark();
	}

	isActive(path: string[]): boolean {
		return this.router.isActive(path[0], {
			paths: 'exact',
			queryParams: 'ignored',
			fragment: 'ignored',
			matrixParams: 'ignored',
		});
	}
}
