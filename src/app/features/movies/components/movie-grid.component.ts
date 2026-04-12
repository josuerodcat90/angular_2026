import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, Signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MovieCardComponent } from './movie-card.component';
import { SkeletonCardComponent } from '../../../shared/components/skeleton/skeleton-card.component';
import type { Movie } from '../models';

/**
 * MovieGridComponent — Responsive grid container for movie cards
 *
 * Features:
 * - CSS Grid responsive layout: 3 columns (desktop) → 2 (tablet) → 1 (mobile)
 * - @for loop with track:imdbID for performance
 * - Delegates card display to MovieCardComponent
 * - Emits events from child cards to parent
 * - Skeleton loading state with SkeletonCardComponent
 *
 * Design:
 * - OnPush change detection
 * - Input: Signal<Movie[]> for reactive updates
 * - Output: favoriteToggled from child cards
 */
@Component({
	selector: 'app-movie-grid',
	standalone: true,
	imports: [CommonModule, MovieCardComponent, SkeletonCardComponent, TranslateModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="w-full my-8">
			<!-- Loading state: show skeleton cards -->
			@if (isLoading()) {
				<div role="status" aria-live="polite" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 px-5">
					@for (skeleton of skeletonItems(); track $index) {
						<app-skeleton-card />
					}
				</div>
			} @else if (movies().length === 0) {
				<p role="status" aria-live="polite" class="text-center text-gray-500 dark:text-gray-400 text-lg p-8">{{ 'APP.NO_RESULTS' | translate }}</p>
			} @else {
				<div role="region" aria-label="Movie results" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 px-5">
					@for (movie of movies(); track movie.imdbID; let i = $index) {
						<app-movie-card
							[movie]="movie"
							[isFavorite]="isFavoriteCheck(movie.imdbID)"
							[fadeInDelay]="i"
							[fadeInKey]="fadeInKey"
							(favoriteToggled)="onFavoriteToggled($event)"
						/>
					}
				</div>
			}
		</div>
	`,
})
export class MovieGridComponent implements OnChanges {
	/**
	 * Signal of movies to display
	 */
	@Input({ required: true }) movies!: Signal<Movie[]>;

	/**
	 * Loading state signal - shows skeleton cards when true
	 */
	@Input({ required: false }) isLoadingInput?: () => boolean;

	/**
	 * Helper to get isLoading value
	 */
	isLoading(): boolean {
		return this.isLoadingInput?.() || false;
	}

	/**
	 * Function to check if movie is favorited (from parent)
	 */
	@Input({ required: true }) isFavoriteCheck!: (id: string) => boolean;

	/**
	 * Number of skeleton cards to show during loading
	 */
	@Input({ required: false }) skeletonCount?: number;

	/**
	 * Array for skeleton @for loop
	 */
	skeletonItems(): number[] {
		const count = this.skeletonCount || 6;
		return Array.from({ length: count }, (_, i) => i);
	}

	/**
	 * Key to force re-render of animations when movies change
	 */
	fadeInKey = 0;

	/**
	 * Update fadeInKey when movies change to restart animations
	 */
	ngOnChanges() {
		this.fadeInKey++;
	}

	/**
	 * Emitted when child card favorite button clicked
	 */
	@Output() favoriteToggled = new EventEmitter<Movie>();

	/**
	 * Forward favorite toggle event to parent component
	 */
	onFavoriteToggled(movie: Movie) {
		this.favoriteToggled.emit(movie);
	}
}
