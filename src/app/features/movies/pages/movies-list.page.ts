import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
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
		<div class="bg-gray-100 dark:bg-gray-900 px-5 py-4 max-w-4xl mx-auto transition-colors duration-150 flex flex-col flex-grow rounded-b-xl">
			<header class="text-center mb-8">
					<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
						<i class="ph ph-video text-4xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i> Movie Search
					</h1>
				<p class="text-gray-600 dark:text-gray-300 text-lg">Find your favorite movies, build a collection of favorites</p>
			</header>

			<!-- Top Rated Slider (only show if we have movies) -->
			@if (apiService.trendingMovies().length > 0 || apiService.isLoading()) {
				<aside aria-label="Top rated movies carousel" class="mb-8">
					<div class="flex items-center justify-between mb-4 flex-wrap gap-4">
						<h2 class="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<i class="ph ph-medal text-3xl text-amber-500 dark:text-amber-400" aria-hidden="true"></i> Top Rated
						</h2>
						<!-- Year Selector -->
						<select 
							[value]="apiService.selectedYear()"
							(change)="onYearChange($event)"
							aria-label="Select year for top rated movies"
							class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							@for (year of apiService.availableYears(); track year) {
								<option [value]="year">{{ year }}</option>
							}
						</select>
					</div>
					<app-movie-slider [movies]="apiService.trendingMovies" />
				</aside>
			}

			<app-search-bar
				[initialValue]="apiService.lastSearchQuery()"
				(search)="onSearch($event)"
				(clearSearch)="onClearSearch()"
			/>

			<!-- Sort Controls (show when we have search results) -->
			@if (apiService.searchResults().length > 0) {
				<div class="mt-8 flex items-center justify-center gap-2">
					<span id="sort-label" class="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
					<select 
						[value]="apiService.sortOption()"
						(change)="onSortChange($event)"
						aria-labelledby="sort-label"
						class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
					>
						<option value="year-asc">Year (Oldest) (default)</option>
						<option value="year-desc">Year (Newest)</option>
						<option value="rating-desc">Rating (Highest)</option>
						<option value="rating-asc">Rating (Lowest)</option>
						<option value="title-asc">Title (A-Z)</option>
						<option value="title-desc">Title (Z-A)</option>
					</select>
				</div>
			}

			<!-- Loading State -->
			@if (apiService.isLoading()) {
				<div role="status" aria-live="polite" class="text-center p-8 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md my-4">
					<p class="text-blue-600 dark:text-blue-400 text-lg">
						<i class="ph ph-spinner animate-spin text-xl align-middle" aria-hidden="true"></i> Searching for movies...
					</p>
				</div>
			}

			<!-- Error State -->
			@if (apiService.error()) {
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg shadow-md my-4">
					<p class="mb-4">{{ apiService.error() }}</p>
					<button (click)="onRetry()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
						<i class="ph ph-arrow-clockwise mr-2" aria-hidden="true"></i>Try Again
					</button>
				</div>
			}

			<!-- Grid Display -->
			@if (!apiService.isLoading() && !apiService.error()) {
				<app-movie-grid
					[movies]="apiService.sortedSearchResults"
					[isFavoriteCheck]="isFavoriteCheck"
					(favoriteToggled)="onFavoriteToggled($event)"
				/>
			}

			<!-- Favorites Badge -->
			<div class="text-center p-4 text-gray-600 dark:text-gray-400 text-sm mt-8">
				<i class="ph ph-heart text-lg align-middle text-red-500" aria-hidden="true"></i> {{ favService.favoriteCount() }} favorite(s)
			</div>
		</div>
	`,
})
export class MoviesListPage implements OnInit {
	/**
	 * Inject services
	 */
	constructor(
		readonly apiService: MoviesApiService,
		readonly favService: FavoritesService,
	) {}

	ngOnInit() {
		// Always reset to current year and reload when entering home
		this.apiService.resetSelectedYear();
		this.apiService.getTopRatedFromYear(this.apiService.selectedYear()).subscribe();
	}

	/**
	 * Handle year change from selector
	 */
	onYearChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const year = parseInt(select.value, 10);
		this.apiService.selectedYear.set(year);
		this.apiService.getTopRatedFromYear(year).subscribe();
	}

	/**
	 * Handle search submission from SearchBarComponent
	 */
	onSearch(query: { title: string }) {
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
		this.apiService.clearLastSearch();
	}

	/**
	 * Handle sort change
	 */
	onSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		this.apiService.sortOption.set(select.value);
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
