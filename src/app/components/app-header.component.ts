import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

/**
 * AppHeader — Navigation bar with theme toggle
 * Shows branding, navigation links, and dark/light mode toggle
 */
@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
		<header class="app-header">
			<div class="header-content">
				<!-- Logo / Brand -->
				<div class="brand">
					<a [routerLink]="['/']" class="brand-link">
						<h1 class="brand-title">🎬 Movie DB</h1>
					</a>
				</div>

				<!-- Navigation -->
				<nav class="nav-menu">
					<a [routerLink]="['/', 'movies']" class="nav-link">Movies</a>
					<a [routerLink]="['/', 'favorites']" class="nav-link">Favorites</a>
				</nav>

				<!-- Theme Toggle -->
				<button
					(click)="toggleTheme()"
					class="theme-toggle"
					[title]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
				>
					<span class="icon">{{ isDark() ? '☀️' : '🌙' }}</span>
				</button>
			</div>
		</header>
	`,
	styles: `
		.app-header {
			background: var(--color-bg-secondary);
			border-bottom: 1px solid var(--color-border);
			padding: 1rem 0;
			position: sticky;
			top: 0;
			z-index: 100;
			box-shadow: 0 2px 4px var(--color-shadow);
		}

		.header-content {
			max-width: 1400px;
			margin: 0 auto;
			padding: 0 2rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 2rem;
		}

		.brand {
			flex-shrink: 0;
			animation: slideDown 0.5s ease-out;
		}

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

		.brand-link {
			text-decoration: none;
		}

		.brand-title {
			margin: 0;
			font-size: 1.5rem;
			font-weight: 700;
			color: var(--color-text-primary);
		}

		.brand-link:hover .brand-title {
			color: var(--color-accent);
		}

		.nav-menu {
			display: flex;
			gap: 2rem;
			align-items: center;
			flex: 1;
		}

		.nav-link {
			color: var(--color-text-secondary);
			text-decoration: none;
			font-weight: 500;
			transition: color 0.2s ease;
			cursor: pointer;

			&:hover {
				color: var(--color-accent);
			}

			&.active {
				color: var(--color-accent);
				border-bottom: 2px solid var(--color-accent);
				padding-bottom: 0.25rem;
			}
		}

		.theme-toggle {
			background: var(--color-bg-primary);
			border: 1px solid var(--color-border);
			border-radius: 50%;
			width: 44px;
			height: 44px;
			font-size: 1.25rem;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s ease;
			flex-shrink: 0;
			animation: slideDown 0.5s ease-out 0.3s both;

			&:hover {
				background: var(--color-bg-tertiary);
				transform: scale(1.05);
			}

			&:active {
				transform: scale(0.95);
			}
		}

		.icon {
			display: inline-block;
			animation: rotate 0.3s ease-out;
		}

		@keyframes rotate {
			from {
				transform: rotate(-180deg);
				opacity: 0;
			}
			to {
				transform: rotate(0deg);
				opacity: 1;
			}
		}

		/* Responsive */
		@media (max-width: 768px) {
			.header-content {
				padding: 0 1rem;
				gap: 1rem;
			}

			.brand-title {
				font-size: 1.2rem;
			}

			.nav-menu {
				gap: 1rem;
				font-size: 0.9rem;
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
