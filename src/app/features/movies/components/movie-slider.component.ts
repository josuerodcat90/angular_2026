import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	ElementRef,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="slider-container">
			<!-- Left Arrow -->
			<button 
				class="slider-arrow slider-arrow--left" 
				(click)="scroll('left')"
				[disabled]="isAtStart()"
				aria-label="Scroll left"
			>
				‹
			</button>

			<!-- Slider Track -->
			<div 
				class="slider-track" 
				#sliderTrack
				(scroll)="onScroll()"
			>
				@for (movie of movies(); track movie.imdbID) {
					<div class="slider-card">
						<a [routerLink]="['/movies', movie.imdbID]" class="card-link">
							<div class="card-poster">
								@if (movie.Poster && movie.Poster !== 'N/A') {
									<img [src]="movie.Poster" [alt]="movie.Title" loading="lazy" />
								} @else {
									<div class="poster-placeholder">🎬</div>
								}
								<div class="card-overlay">
									<span class="view-details">View Details</span>
								</div>
							</div>
							<div class="card-info">
								<h4 class="card-title">{{ movie.Title }}</h4>
								<span class="card-year">{{ movie.Year }}</span>
							</div>
						</a>
					</div>
				}
			</div>

			<!-- Right Arrow -->
			<button 
				class="slider-arrow slider-arrow--right" 
				(click)="scroll('right')"
				[disabled]="isAtEnd()"
				aria-label="Scroll right"
			>
				›
			</button>
		</div>
	`,
	styles: [
		`
		.slider-container {
			position: relative;
			width: 100%;
			margin: 1.5rem 0;
		}

		.slider-track {
			display: flex;
			gap: 1rem;
			overflow-x: auto;
			scroll-behavior: smooth;
			scroll-snap-type: x mandatory;
			padding: 0.5rem;
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE */
		}

		.slider-track::-webkit-scrollbar {
			display: none; /* Chrome/Safari */
		}

		.slider-card {
			flex: 0 0 140px;
			scroll-snap-align: start;
			animation: fadeSlideIn 0.4s ease-out forwards;
			opacity: 0;
		}

		/* Staggered animation delay for each card */
		.slider-card:nth-child(1) { animation-delay: 0.05s; }
		.slider-card:nth-child(2) { animation-delay: 0.1s; }
		.slider-card:nth-child(3) { animation-delay: 0.15s; }
		.slider-card:nth-child(4) { animation-delay: 0.2s; }
		.slider-card:nth-child(5) { animation-delay: 0.25s; }
		.slider-card:nth-child(6) { animation-delay: 0.3s; }
		.slider-card:nth-child(7) { animation-delay: 0.35s; }
		.slider-card:nth-child(8) { animation-delay: 0.4s; }
		.slider-card:nth-child(9) { animation-delay: 0.45s; }
		.slider-card:nth-child(10) { animation-delay: 0.5s; }

		@keyframes fadeSlideIn {
			from {
				opacity: 0;
				transform: translateX(-20px);
			}
			to {
				opacity: 1;
				transform: translateX(0);
			}
		}

		.card-link {
			text-decoration: none;
			display: block;
			width: 140px;
		}

		.card-info {
			padding: 0.5rem 0;
		}

		.card-poster {
			position: relative;
			width: 140px;
			height: 210px;
			border-radius: 8px;
			overflow: hidden;
			background: var(--color-bg-tertiary);
			box-shadow: 0 2px 8px var(--color-shadow);
			transition: transform 0.2s, box-shadow 0.2s;
			flex-shrink: 0;
		}

		.card-poster:hover {
			transform: translateY(-4px);
			box-shadow: 0 4px 16px var(--color-shadow-heavy);
		}

		.card-poster img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.poster-placeholder {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 2.5rem;
			background: var(--color-bg-tertiary);
			color: var(--color-text-tertiary);
		}

		.card-overlay {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: linear-gradient(transparent, rgba(0,0,0,0.8));
			padding: 1.5rem 0.5rem 0.5rem;
			opacity: 0;
			transition: opacity 0.2s;
		}

		.card-poster:hover .card-overlay {
			opacity: 1;
		}

		.view-details {
			color: white;
			font-size: 0.75rem;
			font-weight: 500;
		}

		.card-info {
			padding: 0.5rem 0.25rem;
		}

		.card-title {
			margin: 0;
			font-size: 0.8rem;
			font-weight: 600;
			color: var(--color-text-primary);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.card-year {
			font-size: 0.7rem;
			color: var(--color-text-secondary);
		}

		.slider-arrow {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background: var(--color-bg-primary);
			border: 1px solid var(--color-border);
			color: var(--color-text-primary);
			font-size: 1.5rem;
			cursor: pointer;
			z-index: 10;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s;
			box-shadow: 0 2px 8px var(--color-shadow);
		}

		.slider-arrow:hover:not(:disabled) {
			background: var(--color-accent);
			color: white;
			border-color: var(--color-accent);
		}

		.slider-arrow:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}

		.slider-arrow--left {
			left: -20px;
		}

		.slider-arrow--right {
			right: -20px;
		}

		@media (max-width: 768px) {
			.slider-card {
				flex: 0 0 110px;
			}

			.card-link {
				width: 110px;
			}

			.card-poster {
				width: 110px;
				height: 165px;
			}

			.slider-arrow {
				width: 32px;
				height: 32px;
				font-size: 1.2rem;
			}

			.slider-arrow--left {
				left: -10px;
			}

			.slider-arrow--right {
				right: -10px;
			}
		}
	`,
	],
})
export class MovieSliderComponent {
	@Input({ required: true }) movies!: () => OmdbMovie[];
	@Output() favoriteToggled = new EventEmitter<OmdbMovie>();

	@ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;

	// Signals for scroll position to track arrow state
	private atStart = signal(true);
	private atEnd = signal(false);

	/**
	 * Scroll the slider left or right by one card width
	 */
	scroll(direction: 'left' | 'right'): void {
		const track = this.sliderTrack?.nativeElement;
		if (!track) return;

		const cardWidth = 156; // 140px card + 16px gap
		const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;

		track.scrollBy({
			left: scrollAmount,
			behavior: 'smooth',
		});

		// Update arrow states after scroll
		setTimeout(() => this.updateArrowStates(), 100);
	}

	/**
	 * Check if slider is at the start (disable left arrow)
	 */
	isAtStart = () => this.atStart();

	/**
	 * Check if slider is at the end (disable right arrow)
	 */
	isAtEnd = () => this.atEnd();

	/**
	 * Update arrow enabled/disabled states based on scroll position
	 */
	private updateArrowStates(): void {
		const track = this.sliderTrack?.nativeElement;
		if (!track) return;

		this.atStart.set(track.scrollLeft <= 10);
		this.atEnd.set(track.scrollLeft + track.clientWidth >= track.scrollWidth - 10);
	}

	/**
	 * Handle scroll event to update arrow states
	 */
	onScroll(): void {
		this.updateArrowStates();
	}
}
