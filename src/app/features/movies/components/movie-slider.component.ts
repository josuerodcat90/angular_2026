import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild,
	ChangeDetectorRef,
	effect,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { OmdbMovie } from '../models';

/**
 * MovieSlider — Horizontal scrollable movie slider with navigation arrows
 *
 * Features:
 * - Horizontal scroll with mouse drag or touch
 * - Left/right arrow buttons for navigation
 * - Click on card navigates to detail page
 * - Favorite toggle support
 * - Responsive: smaller cards for compact display
 *
 * Design:
 * - OnPush change detection for performance
 * - CSS scroll-snap for smooth scrolling
 * - Cards stay visible during scroll (peek effect)
 */
@Component({
	selector: 'app-movie-slider',
	standalone: true,
	imports: [CommonModule, RouterLink],
	providers: [DecimalPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="relative w-full my-6">
			<!-- Left Arrow -->
			@if (!isAtStart()) {
				<button 
					class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xl cursor-pointer z-10 flex items-center justify-center transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-md -translate-x-1/2"
					(click)="scroll('left')"
					aria-label="Scroll left"
				>
					<i class="ph ph-caret-left"></i>
				</button>
			}

			<!-- Slider Track -->
			<div 
				class="flex gap-4 overflow-x-auto scroll-smooth snap-x py-2 px-6"
				#sliderTrack
				(scroll)="onScroll()"
			>
				@for (movie of movies(); track movie.imdbID; let i = $index) {
					<div 
						class="flex-shrink-0 w-[140px] snap-start animate-fade-slide-in px-2"
						[style.animation-delay]="i * 50 + 'ms'"
					>
						<a [routerLink]="['/movies', movie.imdbID]" class="block w-[140px] no-underline">
							<div class="relative w-[140px] h-[210px] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex-shrink-0">
								@if (movie.Poster && movie.Poster !== 'N/A') {
									<img [src]="movie.Poster" [alt]="movie.Title" loading="lazy" class="w-full h-full object-cover" />
								} @else {
									<div class="w-full h-full flex items-center justify-center text-4xl bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
										<i class="ph ph-video"></i>
									</div>
								}
								<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 opacity-0 hover:opacity-100 transition-opacity">
									<span class="text-white text-xs font-medium">View Details</span>
								</div>
							</div>
							<div class="py-2 px-1">
								<h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ movie.Title }}</h4>
								<div class="flex items-center justify-between">
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ movie.Year }}</span>
									@if (movie.voteAverage) {
										<span class="text-xs font-medium text-yellow-600 dark:text-yellow-400">
											<i class="ph ph-star text-[10px]"></i> {{ formatRating(movie.voteAverage) }}/10
										</span>
									}
								</div>
							</div>
						</a>
					</div>
				}
			</div>

			<!-- Right Arrow -->
			@if (!isAtEnd()) {
				<button 
					class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xl cursor-pointer z-10 flex items-center justify-center transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-md translate-x-1/2"
					(click)="scroll('right')"
					aria-label="Scroll right"
				>
					<i class="ph ph-caret-right"></i>
				</button>
			}
		</div>
	`,
	styles: [
		`
		.animate-fade-slide-in {
			opacity: 0;
			animation: fadeSlideIn 0.3s ease-out forwards;
		}

		@keyframes fadeSlideIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}
	`,
	],
})
export class MovieSliderComponent {
	@Input({ required: true }) movies!: () => OmdbMovie[];
	@Output() favoriteToggled = new EventEmitter<OmdbMovie>();

	@ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;

	private lastMovieIds = '';
	private isInitialLoad = true;

	constructor(
		private cdr: ChangeDetectorRef,
		private decimalPipe: DecimalPipe,
	) {
		// Effect to detect when movies signal changes
		effect(() => {
			const currentMovies = this.movies();
			const currentIds = currentMovies?.map((m) => m.imdbID).join(',') || '';

			// Detect change by comparing movie IDs (not just length)
			const hasChanged = currentIds !== this.lastMovieIds && this.lastMovieIds !== '';

			if (hasChanged) {
				this.resetScroll();
			}

			// Update tracking after initial load
			if (currentIds) {
				if (this.isInitialLoad) {
					this.isInitialLoad = false;
				}
				this.lastMovieIds = currentIds;
			}
		});
	}

	private resetScroll(): void {
		// Double requestAnimationFrame ensures DOM is fully updated
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (this.sliderTrack?.nativeElement) {
					this.sliderTrack.nativeElement.scrollLeft = 0;
					this.cdr.detectChanges();
				}
			});
		});
	}

	/**
	 * Scroll the slider left or right by one card width
	 */
	scroll(direction: 'left' | 'right'): void {
		const track = this.sliderTrack?.nativeElement;
		if (!track) return;

		const cardWidth = 156; // 140px card + 16px gap
		const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;

		// Prevent scrolling past start (negative scroll)
		if (direction === 'left' && track.scrollLeft <= 0) {
			track.scrollLeft = 0;
			return;
		}

		track.scrollBy({
			left: scrollAmount,
			behavior: 'smooth',
		});
	}

	/**
	 * Check if slider is at the start (disable left arrow)
	 */
	isAtStart(): boolean {
		const track = this.sliderTrack?.nativeElement;
		if (!track) return true;
		return track.scrollLeft <= 10;
	}

	/**
	 * Check if slider is at the end (disable right arrow)
	 */
	isAtEnd(): boolean {
		const track = this.sliderTrack?.nativeElement;
		if (!track) return false;
		return track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
	}

	/**
	 * Handle scroll event to update arrow states
	 */
	onScroll(): void {
		// Just trigger change detection, state is computed directly
	}

	/**
	 * Format rating to 1 decimal place
	 */
	formatRating(rating: number): string {
		return this.decimalPipe.transform(rating, '1.0-1') || rating.toFixed(1);
	}
}
