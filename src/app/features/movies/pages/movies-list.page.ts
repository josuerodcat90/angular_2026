import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MoviesApiService } from '../services/movies-api.service';
import { FavoritesService } from '../services/favorites.service';
import { LanguageService } from '../../../services/language.service';
import { MovieGridComponent } from '../components/movie-grid.component';
import { SearchBarComponent } from '../components/search-bar.component';
import { MovieSliderComponent } from '../components/movie-slider.component';
import { CustomSelectComponent } from '../../../shared/components/custom-select/custom-select.component';
import type { Movie } from '../models';
import { Subscription } from 'rxjs';

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
	imports: [
		CommonModule,
		SearchBarComponent,
		MovieGridComponent,
		MovieSliderComponent,
		CustomSelectComponent,
		TranslateModule,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="bg-gray-100 dark:bg-gray-900 px-5 py-4 max-w-4xl mx-auto transition-colors duration-150 flex flex-col flex-grow rounded-b-xl">
			<header class="text-center mb-8">
					<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
						<i class="ph ph-video text-4xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i> {{ 'APP.TITLE' | translate }}
					</h1>
				<p class="text-gray-600 dark:text-gray-300 text-lg">{{ 'APP.SUBTITLE' | translate }}</p>
			</header>

			<!-- Top Rated Slider (only show if we have movies) -->
			@if (apiService.trendingMovies().length > 0 || apiService.isLoading()) {
				<aside aria-label="Top rated movies carousel" class="mb-8">
					<div class="flex items-center justify-between mb-4 flex-wrap gap-4">
						<h2 class="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
							<i class="ph ph-medal text-3xl text-amber-500 dark:text-amber-400" aria-hidden="true"></i> {{ 'MOVIES.TOP_RATED' | translate }}
						</h2>
						<!-- Year Selector -->
						<app-custom-select
							[options]="yearOptions"
							[selectedValue]="apiService.selectedYear()"
							(valueChange)="onYearValueChange($event)"
							[placeholder]="'MOVIES.SELECT_YEAR' | translate"
							[searchPlaceholder]="'MOVIES.SEARCH_YEAR' | translate"
							[enableSearch]="true"
							[width]="'110px'"
						/>
					</div>
					<app-movie-slider 
						[movies]="apiService.trendingMovies" 
						[isLoadingInput]="apiService.isLoading"
						[skeletonItemCountInput]="6"
					/>
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
					<span id="sort-label" class="text-sm text-gray-600 dark:text-gray-400">{{ 'MOVIES.SORT_BY' | translate }}:</span>
					<app-custom-select
						[options]="sortOptions"
						[selectedValue]="apiService.sortOption()"
						(valueChange)="onSortValueChange($event)"
						[placeholder]="'MOVIES.SORT_PLACEHOLDER' | translate"
						[translateLabels]="true"
						[width]="'180px'"
					/>
				</div>
			}

			<!-- Loading State - ahora se maneja con skeleton en MovieGridComponent -->
			@if (apiService.isLoading()) {
				<!-- Skeleton cards shown in MovieGridComponent -->
			}

			<!-- Error State -->
			@if (apiService.error()) {
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg shadow-md my-4">
					<p class="mb-4">{{ apiService.error() }}</p>
					<button (click)="onRetry()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
						<i class="ph ph-arrow-clockwise mr-2" aria-hidden="true"></i>{{ 'APP.TRY_AGAIN' | translate }}
					</button>
				</div>
			}

			<!-- Grid Display -->
			@if (!apiService.error()) {
				<app-movie-grid
					[movies]="apiService.sortedSearchResults"
					[isLoadingInput]="apiService.isLoading"
					[isFavoriteCheck]="isFavoriteCheck"
					(favoriteToggled)="onFavoriteToggled($event)"
				/>
			}

			<!-- Favorites Badge -->
			<div class="text-center p-4 text-gray-600 dark:text-gray-400 text-sm mt-8">
				<i class="ph ph-heart text-lg align-middle text-red-500" aria-hidden="true"></i> {{ favService.favoriteCount() }} {{ 'MOVIES.FAVORITE_COUNT' | translate }}
			</div>
		</div>
	`,
})
export class MoviesListPage implements OnInit, OnDestroy {
	/**
	 * Inject services
	 */
	constructor(
		readonly apiService: MoviesApiService,
		readonly favService: FavoritesService,
		private languageService: LanguageService,
	) {}

	// Options for custom select components
	yearOptions: { value: number; label: string }[] = [];

	sortOptions = [
		{ value: 'year-asc', label: 'MOVIES.SORT_YEAR_OLD' },
		{ value: 'year-desc', label: 'MOVIES.SORT_YEAR_NEW' },
		{ value: 'rating-desc', label: 'MOVIES.SORT_RATING_HIGH' },
		{ value: 'rating-asc', label: 'MOVIES.SORT_RATING_LOW' },
		{ value: 'title-asc', label: 'MOVIES.SORT_TITLE_AZ' },
		{ value: 'title-desc', label: 'MOVIES.SORT_TITLE_ZA' },
	];

	private langSubscription?: Subscription;

	ngOnInit() {
		// Initialize year options from api service
		this.yearOptions = this.apiService.availableYears().map((year) => ({
			value: year,
			label: year.toString(),
		}));

		// Always reset to current year and reload when entering home
		this.apiService.resetSelectedYear();
		this.apiService.getTopRatedFromYear(this.apiService.selectedYear()).subscribe();

		// Subscribe to language changes - reload data when language changes
		this.langSubscription = this.languageService.languageChanged$.subscribe(() => {
			this.reloadCurrentData();
		});
	}

	ngOnDestroy() {
		this.langSubscription?.unsubscribe();
	}

	private reloadCurrentData() {
		// Reload top rated for current year with new language
		this.apiService.getTopRatedFromYear(this.apiService.selectedYear()).subscribe();

		// Re-run search if there's a pending query
		const lastQuery = this.apiService.lastSearchQuery();
		if (lastQuery) {
			this.apiService.search(lastQuery).subscribe();
		}
	}

	/**
	 * Handle year change from custom select
	 */
	onYearValueChange(year: number) {
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
	 * Handle sort change from custom select
	 */
	onSortValueChange(value: string) {
		this.apiService.sortOption.set(value);
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
