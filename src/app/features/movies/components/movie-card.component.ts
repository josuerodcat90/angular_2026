import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import type { Movie } from '../models';

/**
 * MovieCardComponent — Presentational component for single movie
 *
 * Displays:
 * - Movie poster (with N/A fallback)
 * - Title
 * - Year
 * - Favorite button (heart icon)
 *
 * Events:
 * - favoriteToggled: emitted when heart button clicked
 * - Click card: navigates to detail page
 *
 * Design:
 * - OnPush change detection (manual optimization)
 * - Image error handling (404 → fallback)
 * - No manual subscription; all via inputs
 */
@Component({
	selector: 'app-movie-card',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="movie-card" (click)="onCardClick()">
			<div class="movie-card__poster">
				<img
					[src]="posterUrl"
					[alt]="movie.Title"
					(error)="onImageError($event)"
					class="movie-card__image"
				/>
			</div>

			<div class="movie-card__content">
				<h3 class="movie-card__title">{{ movie.Title }}</h3>
				<p class="movie-card__year">{{ movie.Year }}</p>
			</div>

			<button
				(click)="onFavoriteBtnClick($event)"
				class="movie-card__favorite-btn"
				[class.favorited]="isFavorite"
				type="button"
				aria-label="Toggle favorite"
			>
				<span class="movie-card__favorite-icon">
					{{ isFavorite ? '❤️' : '🤍' }}
				</span>
				{{ isFavorite ? 'Favorited' : 'Favorite' }}
			</button>
		</div>
	`,
	styles: [
		`
			.movie-card {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
				border-radius: 8px;
				overflow: hidden;
				background: var(--color-bg-primary);
				box-shadow: 0 2px 8px var(--color-shadow);
				transition: transform 0.2s, box-shadow 0.2s;
				cursor: pointer;
				height: 100%;
			}

			.movie-card:hover {
				transform: translateY(-4px);
				box-shadow: 0 4px 16px var(--color-shadow-heavy);
			}

			.movie-card__poster {
				width: 100%;
				height: 300px;
				overflow: hidden;
				background: var(--color-bg-tertiary);
				flex-shrink: 0;
			}

			.movie-card__image {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			.movie-card__content {
				padding: 0.75rem;
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
			}

			.movie-card__title {
				margin: 0;
				font-size: 1rem;
				font-weight: 600;
				line-height: 1.3;
				color: var(--color-text-primary);
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.movie-card__year {
				margin: 0;
				font-size: 0.875rem;
				color: var(--color-text-secondary);
			}

			.movie-card__favorite-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;
				padding: 0.5rem 1rem;
				margin: 0.5rem;
				border: none;
				border-radius: 4px;
				background: var(--color-bg-secondary);
				color: var(--color-text-primary);
				font-size: 0.875rem;
				font-weight: 500;
				cursor: pointer;
				transition: background-color 0.2s, color 0.2s;
			}

			.movie-card__favorite-btn:hover {
				background: var(--color-bg-tertiary);
			}

			.movie-card__favorite-btn.favorited {
				background: color-mix(in srgb, #e91e63 20%, var(--color-bg-secondary));
				color: #e91e63;
			}

			.movie-card__favorite-btn.favorited:hover {
				background: color-mix(in srgb, #e91e63 30%, var(--color-bg-secondary));
			}

			.movie-card__favorite-icon {
				font-size: 1.1em;
			}
		`,
	],
})
export class MovieCardComponent {
	/**
	 * The movie object to display
	 */
	@Input({ required: true }) movie!: Movie;

	/**
	 * Whether movie is currently favorited
	 */
	@Input({ required: true }) isFavorite = false;

	/**
	 * Emitted when favorite button clicked
	 */
	@Output() favoriteToggled = new EventEmitter<Movie>();

	/**
	 * Poster to display (falls back to placeholder)
	 */
	posterUrl: string;

	private readonly PLACEHOLDER_POSTER = '/assets/placeholder.png';

	constructor(private router: Router) {
		this.posterUrl = this.PLACEHOLDER_POSTER;
	}

	ngOnInit() {
		this.updatePosterUrl();
	}

	/**
	 * Update poster URL, using placeholder for N/A
	 */
	private updatePosterUrl() {
		if (this.movie?.Poster && this.movie.Poster !== 'N/A') {
			this.posterUrl = this.movie.Poster;
		} else {
			this.posterUrl = this.PLACEHOLDER_POSTER;
		}
	}

	/**
	 * Handle image load error (404, etc.)
	 */
	onImageError(_event: Event) {
		this.posterUrl = this.PLACEHOLDER_POSTER;
	}

	/**
	 * Navigate to detail page on card click
	 */
	onCardClick() {
		this.router.navigate(['/movies', this.movie.imdbID]);
	}

	/**
	 * Emit favorite toggle event (prevent card navigation)
	 */
	onFavoriteBtnClick(event: Event) {
		event.stopPropagation();
		this.favoriteToggled.emit(this.movie);
	}
}
