import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

/**
 * AppHeader — Navigation bar with theme toggle
 * Shows branding, navigation links, and dark/light mode toggle
 */
@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
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
				<nav class="flex gap-8 items-center flex-1">
					<a [routerLink]="['/', 'movies']" 
						routerLinkActive="active"
						class="nav-link"
					>Movies</a>
					<a [routerLink]="['/', 'favorites']" 
						routerLinkActive="active"
						class="nav-link"
					>Favorites</a>
				</nav>

				<!-- Theme Toggle -->
				<button
					(click)="toggleTheme()"
					class="w-11 h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-xl cursor-pointer flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 flex-shrink-0 animate-slide-down"
					[title]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
				>
					<i class="ph text-xl" [class.ph-sun]="isDark()" [class.ph-moon]="!isDark()" [class.text-yellow-500]="isDark()" [class.text-gray-600]="!isDark()"></i>
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

	toggleTheme(): void {
		this.themeService.toggleTheme();
	}

	isDark(): boolean {
		return this.themeService.isDark();
	}
}
