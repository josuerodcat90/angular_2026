import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges,
	signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { Movie } from '../models';

/**
 * MovieCardComponent — Presentational component for single movie
 *
 * Displays:
 * - Movie poster (with N/A fallback)
 * - Title
 * - Year
 * - Favorite button
 *
 * Features:
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
	imports: [CommonModule, TranslateModule],
	providers: [DecimalPipe],
	changeDetection: ChangeDetectionStrategy.Default, // Changed to Default to ensure changes are detected
	template: `
		<div 
			class="movie-card-wrapper"
			[style.--animation-delay]="animationDelay"
			(click)="onCardClick()"
		>
			<div class="flex flex-col rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full animate-fade-in-up">
				<div class="w-full h-[300px] overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative overflow-hidden">
					<!-- Frosted glass background effect -->
					<div class="absolute inset-0 bg-cover bg-center blur-2xl opacity-70 scale-110" [style.backgroundImage]="'url(' + posterUrl + ')'"></div>
					<!-- Frosted glass overlay -->
					<div class="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-sm"></div>
					<!-- Main image centered -->
					<img
						[src]="posterUrl"
						[alt]="movie.Title"
						(error)="onImageError($event)"
						class="relative w-full h-full object-contain z-10 rounded-lg"
					/>
				</div>

				<div class="p-3 flex flex-col gap-1 min-h-[88px]">
					<h3 class="text-base font-semibold leading-tight text-gray-900 dark:text-white line-clamp-2">{{ movie.Title }}</h3>
					<div class="flex items-center justify-between mt-auto">
						<span class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
							<i class="ph ph-calendar-blank text-xs mr-1" aria-hidden="true"></i>{{ movie.Year }}
						</span>
						<span class="text-xs font-medium flex items-center" [class.text-yellow-600]="movie.voteAverage" [class.dark:text-yellow-400]="movie.voteAverage" [class.text-gray-400]="!movie.voteAverage">
							<i class="ph ph-star text-[10px] mr-1" aria-hidden="true"></i>{{ movie.voteAverage ? formatRating(movie.voteAverage) + '/10' : 'N/A' }}
						</span>
					</div>
				</div>

				<button
					(click)="onFavoriteBtnClick($event)"
					(mouseenter)="onHover(true)"
					(mouseleave)="onHover(false)"
					class="group flex items-center justify-center gap-2 p-2 mx-2 mb-2 border-none rounded bg-gray-100 dark:bg-gray-700 text-white text-sm font-medium cursor-pointer transition-colors"
					[class.bg-pink-500]="isFavorite"
					[class.dark:bg-pink-600]="isFavorite"
					[class.hover:bg-gray-200]="!isFavorite"
					[class.dark:hover:bg-gray-600]="!isFavorite"
					[class.hover:bg-pink-600]="isFavorite"
					[class.dark:hover:bg-pink-700]="isFavorite"
					type="button"
					[title]="isFavorite ? ('FAVORITES.REMOVE' | translate) : ('FAVORITES.ADD' | translate)"
					aria-label="Toggle favorite"
				>
					<i class="text-lg" 
						[class]="!isFavorite ? 'ph ph-heart' : (isHovering() ? 'ph-fill ph-heart-break' : 'ph-fill ph-heart')">
					</i>
					<span class="group-hover:hidden">{{ isFavorite ? ('DETAILS.FAVORITED' | translate) : ('FAVORITES.ADD' | translate) }}</span>
					<span class="hidden group-hover:inline">{{ isFavorite ? ('DETAILS.REMOVE_FAVORITES' | translate) : ('FAVORITES.ADD' | translate) }}</span>
				</button>
			</div>
		</div>
	`,
	styles: `
		.movie-card-wrapper {
			animation-delay: var(--animation-delay, 0ms);
		}
		.animate-fade-in-up {
			opacity: 0;
			animation: fadeInUp 0.4s ease-out forwards;
		}
		
		@keyframes fadeInUp {
			from {
				opacity: 0;
				transform: translateY(20px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	`,
})
export class MovieCardComponent implements OnInit, OnChanges {
	/**
	 * The movie object to display
	 */
	@Input({ required: true }) movie!: Movie;

	/**
	 * Whether movie is currently favorited
	 */
	@Input({ required: true }) isFavorite = false;

	/**
	 * Delay for staggered animation (passed from parent grid)
	 */
	@Input() fadeInDelay = 0;

	/**
	 * Key to force animation restart when parent re-renders
	 */
	@Input() fadeInKey = 0;

	/**
	 * Track hover state for icon change
	 */
	isHovering = signal(false);

	onHover(hovering: boolean) {
		this.isHovering.set(hovering);
	}

	/**
	 * Computed animation delay
	 */
	get animationDelay(): string {
		return `${this.fadeInDelay * 50}ms`;
	}

	/**
	 * Emitted when favorite button clicked
	 */
	@Output() favoriteToggled = new EventEmitter<Movie>();

	/**
	 * Poster to display (falls back to placeholder)
	 */
	posterUrl: string;

	private readonly PLACEHOLDER_POSTER = '/assets/placeholder.png';

	constructor(
		private router: Router,
		private cdr: ChangeDetectorRef,
		private decimalPipe: DecimalPipe,
	) {
		this.posterUrl = this.PLACEHOLDER_POSTER;
	}

	ngOnInit() {
		this.updatePosterUrl();
		// Start animation when component initializes
		this.triggerAnimation();
	}

	ngOnChanges() {
		// Restart animation when inputs change (new movie data)
		this.triggerAnimation();
	}

	private triggerAnimation() {
		// Use setTimeout to ensure the DOM is ready and animation plays
		setTimeout(() => {
			const element = document.querySelector('.animate-fade-in-up') as HTMLElement;
			if (element) {
				// Force reflow to restart animation
				element.classList.remove('animate-fade-in-up');
				void element.offsetWidth; // Force reflow
				element.classList.add('animate-fade-in-up');
			}
		}, 0);
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
	 * Format rating to 1 decimal place
	 */
	formatRating(rating: number): string {
		return this.decimalPipe.transform(rating, '1.0-1') || rating.toFixed(1);
	}

	/**
	 * Emit favorite toggle event (prevent card navigation)
	 */
	onFavoriteBtnClick(event: Event) {
		event.stopPropagation();
		this.favoriteToggled.emit(this.movie);
	}
}
