import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviesApiService } from '../services/movies-api.service';
import { FavoritesService } from '../services/favorites.service';
import { MovieGridComponent } from '../components/movie-grid.component';
import { SearchBarComponent } from '../components/search-bar.component';
import { MovieSliderComponent } from '../components/movie-slider.component';
import type { Movie } from '../models';

/**
 * MoviesListPage — Main search and browse interface
 *
 * Integrates:
 * - SearchBarComponent: reactive form for queries
 * - MovieGridComponent: responsive grid display
 * - MoviesApiService: API calls + caching
 * - FavoritesService: favorite state + persistence
 *
 * Features:
 * - Search results displayed in grid
 * - Favorite toggle with localStorage persistence
 * - Click card → detail page navigation
 * - Error handling with retry button
 * - Loading state
 *
 * Design:
 * - OnPush change detection
 * - Computed signals for derived state (no API calls)
 * - Services manage state; page wires components
 */
@Component({
	selector: 'app-movies-list',
	standalone: true,
	imports: [CommonModule, SearchBarComponent, MovieGridComponent, MovieSliderComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="movies-list-page">
			<header class="movies-list-page__header">
				<h1>🎬 Movie Search</h1>
				<p>Find your favorite movies, build a collection of favorites</p>
			</header>

			<!-- Top Rated Slider (only show if we have movies) -->
			@if (apiService.trendingMovies().length > 0) {
				<section class="movies-list-page__slider-section">
					<h2 class="slider-title">🏆 Top Rated from {{ lastYear }}</h2>
					<app-movie-slider [movies]="apiService.trendingMovies" />
				</section>
			}

			<app-search-bar
				(search)="onSearch($event)"
				(clearSearch)="onClearSearch()"
			/>

			<!-- Loading State -->
			@if (apiService.isLoading()) {
				<div class="movies-list-page__loading">
					<p>Searching for movies...</p>
				</div>
			}

			<!-- Error State -->
			@if (apiService.error()) {
				<div class="movies-list-page__error">
					<p>{{ apiService.error() }}</p>
					<button (click)="onRetry()" class="movies-list-page__retry-btn">
						Try Again
					</button>
				</div>
			}

			<!-- Grid Display -->
			@if (!apiService.isLoading() && !apiService.error()) {
				<app-movie-grid
					[movies]="apiService.searchResults"
					[isFavoriteCheck]="isFavoriteCheck"
					(favoriteToggled)="onFavoriteToggled($event)"
				/>
			}

			<!-- Favorites Badge -->
			<div class="movies-list-page__favorites-badge">
				❤️ {{ favService.favoriteCount() }} favorite(s)
			</div>
		</div>
	`,
	styles: [
		`
			.movies-list-page {
				min-height: 100vh;
				background: var(--color-bg-secondary);
				padding: 1rem;
				max-width: 1000px;
				margin: 0 auto;
				transition: background-color 0.3s ease;
			}

			.movies-list-page__header {
				text-align: center;
				margin-bottom: 2rem;
				color: var(--color-text-primary);
			}

			.movies-list-page__header h1 {
				margin: 0 0 0.5rem 0;
				font-size: 2.5rem;
			}

			.movies-list-page__header p {
				margin: 0;
				color: var(--color-text-secondary);
				font-size: 1.1rem;
			}

			.movies-list-page__loading,
			.movies-list-page__error {
				text-align: center;
				padding: 2rem;
				background: var(--color-bg-secondary);
				border-radius: 8px;
				margin: 1rem 0;
				box-shadow: 0 2px 8px var(--color-shadow);
			}

			.movies-list-page__loading {
				color: var(--color-accent);
				font-size: 1.1rem;
			}

			.movies-list-page__error {
				background: color-mix(in srgb, var(--color-error) 10%, var(--color-bg-secondary));
				color: var(--color-error);
				border: 1px solid var(--color-error);
			}

			.movies-list-page__error p {
				margin: 0 0 1rem 0;
				font-size: 1rem;
			}

			.movies-list-page__retry-btn {
				padding: 0.75rem 1.5rem;
				background: var(--color-error);
				color: white;
				border: none;
				border-radius: 4px;
				font-size: 1rem;
				cursor: pointer;
				transition: background-color 0.2s;
			}

			.movies-list-page__retry-btn:hover {
				background: color-mix(in srgb, var(--color-error) 80%, black);
			}

			.movies-list-page__favorites-badge {
				text-align: center;
				padding: 1rem;
				color: var(--color-text-secondary);
				font-size: 0.95rem;
				margin-top: 2rem;
			}

			.movies-list-page__slider-section {
				margin-bottom: 2rem;
			}

			.slider-title {
				margin: 0 0 1rem 0;
				font-size: 1.5rem;
				color: var(--color-text-primary);
			}

			@media (max-width: 768px) {
				.movies-list-page {
					padding: 0.5rem;
				}

				.movies-list-page__header h1 {
					font-size: 1.75rem;
				}

				.movies-list-page__header p {
					font-size: 1rem;
				}
			}
		`,
	],
})
export class MoviesListPage implements OnInit {
	/**
	 * Inject services
	 */
	constructor(
		readonly apiService: MoviesApiService,
		readonly favService: FavoritesService,
	) {}

	/**
	 * Get last year for display
	 */
	get lastYear(): number {
		return new Date().getFullYear() - 1;
	}

	ngOnInit() {
		// Load trending movies for the slider
		this.apiService.getTopRatedFromLastYear().subscribe();
	}

	/**
	 * Handle search submission from SearchBarComponent
	 */
	onSearch(query: { title: string; year?: number }) {
		// Call API service to search
		// The service updates its signals, component reads via apiService.searchResults
		this.apiService.search(query.title).subscribe();
	}

	/**
	 * Handle clear search
	 */
	onClearSearch() {
		this.apiService.searchResults.set([]);
		this.apiService.error.set(null);
	}

	/**
	 * Handle favorite toggle from MovieGridComponent
	 */
	onFavoriteToggled(movie: Movie) {
		this.favService.toggleFavorite(movie);
	}

	/**
	 * Check if movie is favorited (for card state)
	 */
	isFavoriteCheck = (id: string) => this.favService.isFavorite(id);

	/**
	 * Retry last search
	 */
	onRetry() {
		this.apiService.retry();
	}
}
