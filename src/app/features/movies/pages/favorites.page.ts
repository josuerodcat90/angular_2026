import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../services/favorites.service';
import { MovieGridComponent } from '../components/movie-grid.component';

/**
 * FavoritesPage — User's saved movies collection
 *
 * Displays all movies saved to favorites via FavoritesService.
 * Allows removing movies from favorites via the grid component.
 *
 * Features:
 * - Shows all favorited movies in a grid
 * - Remove from favorites functionality
 * - Empty state when no favorites
 * - OnPush change detection for performance
 */
@Component({
	selector: 'app-favorites-page',
	standalone: true,
	imports: [CommonModule, MovieGridComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="favorites-page">
			<header class="favorites-page__header">
				<h1>❤️ My Favorites</h1>
				<p>Your personal collection of favorite movies</p>
			</header>

			<!-- Empty State -->
			@if (favService.favorites().length === 0) {
				<div class="favorites-page__empty">
					<div class="empty-icon">🎬</div>
					<h2>No favorites yet</h2>
					<p>Start adding movies to your favorites from the search page!</p>
					<a href="/movies" class="favorites-page__search-link">
						Search Movies
					</a>
				</div>
			}

			<!-- Favorites Grid -->
			@if (favService.favorites().length > 0) {
				<app-movie-grid
					[movies]="favService.favorites"
					[isFavoriteCheck]="isFavoriteCheck"
					(favoriteToggled)="onFavoriteToggled($event)"
				/>

				<div class="favorites-page__count">
					❤️ {{ favService.favorites().length }} movie(s) in your collection
				</div>
			}
		</div>
	`,
	styles: [
		`
			.favorites-page {
				min-height: 100vh;
				background: var(--color-bg-secondary);
				padding: 1rem;
				max-width: 1000px;
				margin: 0 auto;
				transition: background-color 0.3s ease;
			}

			.favorites-page__header {
				text-align: center;
				margin-bottom: 2rem;
				color: var(--color-text-primary);
			}

			.favorites-page__header h1 {
				margin: 0 0 0.5rem 0;
				font-size: 2.5rem;
			}

			.favorites-page__header p {
				margin: 0;
				color: var(--color-text-secondary);
				font-size: 1.1rem;
			}

			.favorites-page__empty {
				text-align: center;
				padding: 3rem 2rem;
				background: var(--color-bg-primary);
				border-radius: 12px;
				box-shadow: 0 2px 8px var(--color-shadow);
			}

			.empty-icon {
				font-size: 4rem;
				margin-bottom: 1rem;
			}

			.favorites-page__empty h2 {
				margin: 0 0 0.5rem 0;
				color: var(--color-text-primary);
				font-size: 1.5rem;
			}

			.favorites-page__empty p {
				margin: 0 0 1.5rem 0;
				color: var(--color-text-secondary);
			}

			.favorites-page__search-link {
				display: inline-block;
				padding: 0.75rem 1.5rem;
				background: var(--color-accent);
				color: white;
				text-decoration: none;
				border-radius: 6px;
				font-weight: 500;
				transition: background-color 0.2s, transform 0.2s;
			}

			.favorites-page__search-link:hover {
				background: color-mix(in srgb, var(--color-accent) 80%, black);
				transform: translateY(-2px);
			}

			.favorites-page__count {
				text-align: center;
				padding: 1rem;
				color: var(--color-text-secondary);
				font-size: 0.95rem;
				margin-top: 2rem;
			}

			@media (max-width: 768px) {
				.favorites-page {
					padding: 0.5rem;
				}

				.favorites-page__header h1 {
					font-size: 1.75rem;
				}
			}
		`,
	],
})
export class FavoritesPage {
	constructor(readonly favService: FavoritesService) {}

	/**
	 * Check if movie is favorited (always true on this page)
	 */
	isFavoriteCheck = (_id: string) => true;

	/**
	 * Handle remove from favorites
	 */
	onFavoriteToggled(movie: { imdbID: string }) {
		this.favService.removeFavorite(movie.imdbID);
	}
}
