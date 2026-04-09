import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService, SortOption } from '../services/favorites.service';
import { MovieGridComponent } from '../components/movie-grid.component';

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
	imports: [CommonModule, MovieGridComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="bg-gray-100 dark:bg-gray-900 px-5 py-4 max-w-4xl mx-auto transition-colors duration-150 flex flex-col flex-grow rounded-b-xl min-h-[calc(100vh-80px)]">
			<header class="text-center mb-6">
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
					<i class="ph ph-heart text-4xl text-red-500 dark:text-red-400"></i> My Favorites
				</h1>
				<p class="text-gray-600 dark:text-gray-300 text-lg">Your personal collection of favorite movies</p>
			</header>

			<!-- Sort Controls -->
			@if (favService.favorites().length > 0) {
				<div class="flex items-center justify-center mb-4 gap-2">
					<span class="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
					<select 
						[value]="favService.sortOption()"
						(change)="onSortChange($event)"
						class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="none">Default (added order)</option>
						<option value="title-asc">Title (A-Z)</option>
						<option value="title-desc">Title (Z-A)</option>
						<option value="year-desc">Year (Newest)</option>
						<option value="year-asc">Year (Oldest)</option>
						<option value="rating-desc">Rating (Highest)</option>
						<option value="rating-asc">Rating (Lowest)</option>
					</select>
				</div>
			}

			<!-- Empty State -->
			@if (favService.favorites().length === 0) {
				<div class="text-center p-8 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md">
					<i class="ph ph-film-slate text-7xl text-gray-400 dark:text-gray-500 mb-4 block"></i>
					<h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-6">Start adding movies to your favorites from the search page!</p>
					<a 
						href="/movies" 
						class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:-translate-y-1 hover:shadow-lg"
					>
						<i class="ph ph-magnifying-glass mr-2"></i>Search Movies
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
					<i class="ph ph-heart text-lg align-middle text-red-500"></i> {{ favService.favorites().length }} movie(s) in your collection
				</div>
			}
		</div>
	`,
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

	/**
	 * Handle sort change
	 */
	onSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		this.favService.sortOption.set(select.value as SortOption);
	}
}
