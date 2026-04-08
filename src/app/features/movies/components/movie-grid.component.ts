import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from './movie-card.component';
import type { Movie } from '../models';

/**
 * MovieGridComponent — Responsive grid container for movie cards
 *
 * Features:
 * - CSS Grid responsive layout: 3 columns (desktop) → 2 (tablet) → 1 (mobile)
 * - @for loop with track:imdbID for performance
 * - Delegates card display to MovieCardComponent
 * - Emits events from child cards to parent
 *
 * Design:
 * - OnPush change detection
 * - Input: Signal<Movie[]> for reactive updates
 * - Output: favoriteToggled from child cards
 */
@Component({
	selector: 'app-movie-grid',
	standalone: true,
	imports: [CommonModule, MovieCardComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="movie-grid">
			@if (movies().length === 0) {
				<p class="movie-grid__empty">No movies found. Try searching for a title.</p>
			} @else {
				<div class="movie-grid__container">
					@for (movie of movies(); track movie.imdbID) {
						<app-movie-card
							[movie]="movie"
							[isFavorite]="isFavoriteCheck(movie.imdbID)"
							(favoriteToggled)="onFavoriteToggled($event)"
						/>
					}
				</div>
			}
		</div>
	`,
	styles: [
		`
			.movie-grid {
				width: 100%;
				margin: 2rem 0;
			}

			.movie-grid__empty {
				text-align: center;
				color: #666;
				font-size: 1.1rem;
				padding: 2rem;
			}

			.movie-grid__container {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
				gap: 1.5rem;
				padding: 1rem;
			}

			/* Card animation */
			.movie-card {
				animation: fadeScaleIn 0.4s ease-out forwards;
				opacity: 0;
			}

			/* Staggered animation delay */
			.movie-card:nth-child(1) { animation-delay: 0.05s; }
			.movie-card:nth-child(2) { animation-delay: 0.1s; }
			.movie-card:nth-child(3) { animation-delay: 0.15s; }
			.movie-card:nth-child(4) { animation-delay: 0.2s; }
			.movie-card:nth-child(5) { animation-delay: 0.25s; }
			.movie-card:nth-child(6) { animation-delay: 0.3s; }
			.movie-card:nth-child(7) { animation-delay: 0.35s; }
			.movie-card:nth-child(8) { animation-delay: 0.4s; }
			.movie-card:nth-child(9) { animation-delay: 0.45s; }
			.movie-card:nth-child(10) { animation-delay: 0.5s; }
			.movie-card:nth-child(11) { animation-delay: 0.55s; }
			.movie-card:nth-child(12) { animation-delay: 0.6s; }
			.movie-card:nth-child(13) { animation-delay: 0.65s; }
			.movie-card:nth-child(14) { animation-delay: 0.7s; }
			.movie-card:nth-child(15) { animation-delay: 0.75s; }
			.movie-card:nth-child(16) { animation-delay: 0.8s; }
			.movie-card:nth-child(17) { animation-delay: 0.85s; }
			.movie-card:nth-child(18) { animation-delay: 0.9s; }
			.movie-card:nth-child(19) { animation-delay: 0.95s; }
			.movie-card:nth-child(20) { animation-delay: 1s; }

			@keyframes fadeScaleIn {
				from {
					opacity: 0;
					transform: scale(0.9);
				}
				to {
					opacity: 1;
					transform: scale(1);
				}
			}

			@media (max-width: 768px) {
				.movie-grid__container {
					grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
					gap: 1rem;
					padding: 0.75rem;
				}
			}

			@media (max-width: 480px) {
				.movie-grid__container {
					grid-template-columns: 1fr;
					gap: 1rem;
					padding: 0.5rem;
				}
			}
		`,
	],
})
export class MovieGridComponent {
	/**
	 * Signal of movies to display
	 */
	@Input({ required: true }) movies!: Signal<Movie[]>;

	/**
	 * Function to check if movie is favorited (from parent)
	 */
	@Input({ required: true }) isFavoriteCheck!: (id: string) => boolean;

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
