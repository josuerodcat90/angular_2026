import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FavoritesService, SortOption } from '../services/favorites.service';
import { MovieGridComponent } from '../components/movie-grid.component';
import { CustomSelectComponent } from '../../../shared/components/custom-select/custom-select.component';

/**
 * FavoritesPage — User's saved movies collection
 *
 * Displays all movies saved to favorites via FavoritesService.
 * Migrated to Tailwind CSS + Phosphor Icons
 *
 * Features:
 * - Shows all favorited movies in a grid
 * - Remove from favorites functionality
 * - Sort by year or rating
 * - Empty state when no favorites
 * - OnPush change detection for performance
 */
@Component({
	selector: 'app-favorites-page',
	standalone: true,
	imports: [CommonModule, MovieGridComponent, CustomSelectComponent, TranslateModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="bg-gray-100 dark:bg-gray-900 px-5 py-4 max-w-4xl mx-auto transition-colors duration-150 flex flex-col flex-grow rounded-b-xl min-h-[calc(100vh-80px)]">
			<header class="text-center mb-6">
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
					<i class="ph ph-heart text-4xl text-red-500 dark:text-red-400" aria-hidden="true"></i> {{ 'FAVORITES.TITLE' | translate }}
				</h1>
				<p class="text-gray-600 dark:text-gray-300 text-lg">{{ 'FAVORITES.SUBTITLE' | translate }}</p>
			</header>

			<!-- Sort Controls -->
			@if (favService.favorites().length > 0) {
				<div class="flex items-center justify-center mb-4 gap-2">
					<span id="fav-sort-label" class="text-sm text-gray-600 dark:text-gray-400">{{ 'MOVIES.SORT_BY' | translate }}:</span>
					<app-custom-select
						[options]="sortOptions"
						[selectedValue]="favService.sortOption()"
						(valueChange)="onSortValueChange($event)"
						[placeholder]="'FAVORITES.SORT_DEFAULT' | translate"
						[translateLabels]="true"
						[width]="'260px'"
					/>
				</div>
			}

			<!-- Empty State -->
			@if (favService.favorites().length === 0) {
				<div class="text-center p-8 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md">
					<i class="ph ph-film-slate text-7xl text-gray-400 dark:text-gray-500 mb-4 block" aria-hidden="true"></i>
					<h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{{ 'FAVORITES.EMPTY' | translate }}</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">{{ 'FAVORITES.START_ADDING' | translate }}</p>
					<a 
						href="/movies" 
						class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
					>
						<i class="ph ph-magnifying-glass mr-2" aria-hidden="true"></i>{{ 'NAV.MOVIES' | translate }}
					</a>
				</div>
			}

			<!-- Favorites Grid -->
			@if (favService.sortedFavorites().length > 0) {
				<app-movie-grid
					[movies]="favService.sortedFavorites"
					[isFavoriteCheck]="isFavoriteCheck"
					(favoriteToggled)="onFavoriteToggled($event)"
				/>

				<div class="text-center p-4 text-gray-600 dark:text-gray-400 text-sm mt-8">
					<i class="ph ph-heart text-lg align-middle text-red-500" aria-hidden="true"></i> {{ favService.favorites().length }} {{ 'FAVORITES.COUNT' | translate }}
				</div>
			}
		</div>
	`,
})
export class FavoritesPage {
	constructor(readonly favService: FavoritesService) {}

	/**
	 * Sort options for favorites page
	 */
	sortOptions = [
		{ value: 'none', label: 'FAVORITES.SORT_DEFAULT' },
		{ value: 'title-asc', label: 'FAVORITES.SORT_TITLE_AZ' },
		{ value: 'title-desc', label: 'FAVORITES.SORT_TITLE_ZA' },
		{ value: 'year-desc', label: 'FAVORITES.SORT_YEAR_NEW' },
		{ value: 'year-asc', label: 'FAVORITES.SORT_YEAR_OLD' },
		{ value: 'rating-desc', label: 'FAVORITES.SORT_RATING_HIGH' },
		{ value: 'rating-asc', label: 'FAVORITES.SORT_RATING_LOW' },
	];

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

	/**
	 * Handle sort change from custom select
	 */
	onSortValueChange(value: string) {
		this.favService.sortOption.set(value as SortOption);
	}
}
