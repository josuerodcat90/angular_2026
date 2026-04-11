import { Component, inject, signal, computed, effect, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MoviesApiService } from '../services/movies-api.service';
import { FavoritesService } from '../services/favorites.service';

/**
 * MovieDetailPage — Full movie information display
 * Shows complete details, poster, plot, ratings, favorite button
 *
 * Route: /movies/:id
 * - Extracts movie ID from URL params
 * - Loads movie details from API via service signal
 * - Displays poster, title, year, plot, ratings
 * - Toggle favorite status
 * - Back button to navigate
 *
 * Design: Tailwind CSS + Phosphor Icons + Dark mode support
 */
@Component({
	selector: 'app-movie-detail',
	standalone: true,
	imports: [CommonModule, RouterLink, TranslateModule],
	template: `
		<div class="bg-gray-100 dark:bg-gray-900 px-5 py-4 max-w-4xl mx-auto transition-colors duration-150 flex flex-col flex-grow rounded-b-xl min-h-[calc(100vh-80px)]">
			<!-- Header -->
			<div class="flex items-center gap-4 mb-6">
				<button 
					[routerLink]="['/movies']" 
					class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
				>
					<i class="ph ph-arrow-left" aria-hidden="true"></i> {{ 'DETAILS.BACK' | translate }}
				</button>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex-1 text-center">{{ 'DETAILS.MOVIE_DETAILS' | translate }}</h1>
				<div class="w-20"></div>
			</div>

						<!-- Loading state -->
			@if (apiService.isLoading()) {
				<div role="status" aria-live="polite" class="flex flex-col items-center justify-center p-12 bg-gray-200 dark:bg-gray-800 rounded-xl">
					<i class="ph ph-spinner animate-spin text-5xl text-blue-600 dark:text-blue-400 mb-4" aria-hidden="true"></i>
					<p class="text-gray-600 dark:text-gray-400 text-lg">{{ 'DETAILS.LOADING_DETAILS' | translate }}</p>
				</div>
			}

			<!-- Error state -->
			@if (apiService.error() && !apiService.isLoading()) {
				<div class="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400 p-6 rounded-xl">
					<div class="flex flex-col items-center gap-4">
						<p class="text-lg">{{ apiService.error() }}</p>
						<button 
							(click)="apiService.clearError()" 
							class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
						>
							{{ 'DETAILS.CLOSE' | translate }}
						</button>
					</div>
				</div>
			}

			<!-- Movie detail content -->
			@if (movie() && !apiService.isLoading()) {
				<!-- HERO: Poster + Info + Plot with frosted glass background -->
				<div class="relative bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md overflow-hidden">
					<!-- Frosted glass background image -->
					@if (heroPoster()) {
						<div 
							class="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-110"
							[style.backgroundImage]="'url(' + heroPoster() + ')'"
						></div>
						<!-- Overlay -->
						<div class="absolute inset-0 bg-white/20 dark:bg-black/40"></div>
					}
					
					<!-- Content -->
					<div class="relative flex flex-col md:flex-row gap-6 h-[400px]">
						<!-- Poster -->
						<div class="flex-shrink-0 h-full">
							<img
								[src]="movie()!.Poster"
								[alt]="movie()!.Title"
								class="h-full w-auto rounded-lg shadow-lg object-cover"
							/>
						</div>

						<!-- Info -->
						<div class="flex-1 flex flex-col justify-between h-full gap-4">
							<h2 class="text-3xl font-bold text-gray-900 dark:text-white leading-tight drop-shadow-md">
								{{ movie()!.Title }}
							</h2>

							<!-- Quick info badges -->
							<div class="flex flex-wrap gap-2">
								@if (movie()!.Year) {
									<span class="flex items-center gap-1 px-3 py-1.5 bg-gray-300/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-sm text-gray-800 dark:text-gray-200">
										<i class="ph ph-calendar-blank" aria-hidden="true"></i>{{ movie()!.Year }}
									</span>
								}
								@if (movie()!.Type) {
									<span class="px-3 py-1.5 bg-blue-500/80 text-white rounded-full text-sm font-medium uppercase backdrop-blur-sm">
										{{ movie()!.Type }}
									</span>
								}
								@if (movie()!.Runtime && movie()!.Runtime !== 'N/A') {
									<span class="flex items-center gap-1 px-3 py-1.5 bg-gray-300/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-sm text-gray-800 dark:text-gray-200">
										<i class="ph ph-clock" aria-hidden="true"></i>{{ movie()!.Runtime }}
									</span>
								}
								@if (movie()!.Rated && movie()!.Rated !== 'N/A') {
									<span class="px-3 py-1.5 bg-orange-500/80 text-white rounded-full text-sm font-medium backdrop-blur-sm">
										{{ movie()!.Rated }}
									</span>
								}
							</div>

							<!-- Plot + Favorite Button (juntos, con space-between) -->
							<div class="flex flex-col justify-between gap-4 flex-1">
								<!-- Plot en caja separada -->
								@if (movie()!.Plot && movie()!.Plot !== 'N/A') {
									<div class="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border-l-4 border-blue-500">
										<div class="flex items-center gap-2 mb-2">
											<i class="ph ph-book-open text-xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
											<span class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">{{ 'DETAILS.PLOT' | translate }}</span>
										</div>
										<p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{{ movie()!.Plot }}</p>
									</div>
								}

								<!-- Favorite button (al fondo) -->
								<button
									(click)="toggleFavorite()"
									(mouseenter)="onHover(true)"
									(mouseleave)="onHover(false)"
									[attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
									class="group relative flex items-center justify-center gap-2 px-6 py-3 bg-gray-300/80 dark:bg-gray-700/80 backdrop-blur-sm text-white rounded-lg font-medium transition-colors cursor-pointer"
									[class.bg-pink-500]="isFavorite()"
									[class.dark:bg-pink-600]="isFavorite()"
									[class.hover:bg-gray-400]="!isFavorite()"
									[class.dark:hover:bg-gray-600]="!isFavorite()"
									[class.hover:bg-pink-600]="isFavorite()"
									[class.dark:hover:bg-pink-700]="isFavorite()"
								>
									<!-- Icono: ph-heart si no es favorito, ph-fill ph-heart si lo es, ph-fill ph-heart-break en hover cuando es favorito -->
									<i class="text-xl" 
										[class]="!isFavorite() ? 'ph ph-heart' : (isHovering() ? 'ph-fill ph-heart-break' : 'ph-fill ph-heart')"
										aria-hidden="true">
									</i>
									<span class="group-hover:hidden">{{ isFavorite() ? ('DETAILS.FAVORITED' | translate) : ('DETAILS.ADD_FAVORITES' | translate) }}</span>
									<span class="hidden group-hover:inline">{{ isFavorite() ? ('DETAILS.REMOVE_FAVORITES' | translate) : ('DETAILS.ADD_FAVORITES' | translate) }}</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Genres -->
				@if (movie()!.Genre) {
					<section class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
						<div class="flex items-center gap-2 mb-4">
							<i class="ph ph-tag text-2xl text-green-600 dark:text-green-400" aria-hidden="true"></i>
							<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'DETAILS.GENRES' | translate }}</h3>
						</div>
						<div class="flex flex-wrap gap-2">
							@for (genre of getGenres(); track genre) {
								<span class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors">
									{{ genre }}
								</span>
							}
						</div>
					</section>
				}

				<!-- Backdrops / Scenes -->
				@if (backdrops().length > 0) {
					<section class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-2">
								<i class="ph ph-images text-2xl text-purple-600 dark:text-purple-400" aria-hidden="true"></i>
								<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'DETAILS.SCENES' | translate }}</h3>
							</div>
							@if (backdrops().length > 8) {
								<span class="px-3 py-1 bg-purple-500/80 text-white rounded-full text-sm font-medium backdrop-blur-sm" aria-label="{{ backdrops().length - 8 }} additional images">
									+{{ backdrops().length - 8 }}
								</span>
							} @else if (backdrops().length > 0) {
								<span class="px-3 py-1 bg-purple-500/80 text-white rounded-full text-sm font-medium backdrop-blur-sm">
									{{ backdrops().length }}
								</span>
							}
						</div>
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							@for (backdrop of sceneBackdrops(); track backdrop.file_path; let i = $index) {
								<img
									[src]="'https://image.tmdb.org/t/p/w780' + backdrop.file_path"
									[alt]="'Scene from ' + movie()!.Title"
									(click)="openImageModal(i)"
									class="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
								/>
							}
						</div>
					</section>
				}

				<!-- Image Modal -->
				@if (showImageModal()) {
					<div 
						role="dialog"
						aria-modal="true"
						aria-label="Image gallery"
						class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm image-modal-container"
						[class.animate-fade-in]="!isClosing()"
						[class.animate-fade-out]="isClosing()"
						tabindex="-1"
						(click)="closeImageModal()"
					>
						<!-- Close button -->
						<button
							(click)="closeImageModal()"
							[attr.aria-label]="'DETAILS.CLOSE_GALLERY' | translate"
							[title]="'DETAILS.CLOSE' | translate"
							class="fixed top-24 right-4 flex items-center justify-center p-3 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full shadow-lg transition-colors cursor-pointer"
						>
							<i class="ph ph-x text-2xl" aria-hidden="true"></i>
						</button>

						<!-- Previous button -->
						<button
							(click)="prevImage(); $event.stopPropagation()"
							[disabled]="currentImageIndex() === 0"
							aria-label="Previous image"
							title="Previous image"
							class="absolute left-4 z-10 flex items-center justify-center p-3 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed animate-slide-in-left cursor-pointer"
						>
							<i class="ph ph-caret-left text-2xl" aria-hidden="true"></i>
						</button>

						<!-- Image -->
						<div class="w-full h-full flex items-center justify-center">
							<img
								[src]="'https://image.tmdb.org/t/p/original' + backdrops()[currentImageIndex()].file_path"
								[alt]="'Scene ' + (currentImageIndex() + 1) + ' of ' + backdrops().length"
								[class.animate-fade-in-out]="slideDirection() !== null"
								class="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
								(click)="$event.stopPropagation()"
							/>
						</div>

						<!-- Next button -->
						<button
							(click)="nextImage(); $event.stopPropagation()"
							[disabled]="currentImageIndex() === backdrops().length - 1"
							aria-label="Next image"
							title="Next image"
							class="absolute right-4 z-10 flex items-center justify-center p-3 bg-gray-900/50 hover:bg-gray-900/80 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed animate-slide-in-right cursor-pointer"
						>
							<i class="ph ph-caret-right text-2xl" aria-hidden="true"></i>
						</button>

						<!-- Counter -->
						<div aria-live="polite" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/50 px-4 py-2 rounded-full text-white text-sm animate-fade-in-up">
							{{ currentImageIndex() + 1 }} / {{ backdrops().length }}
						</div>
					</div>
				}

				<!-- Ratings -->
				<section class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
					<div class="flex items-center gap-2 mb-4">
						<i class="ph ph-star text-2xl text-yellow-500 dark:text-yellow-400" aria-hidden="true"></i>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">Ratings</h3>
					</div>
					@if (movie()!.voteAverage) {
						<div class="grid grid-cols-2 gap-4">
							<div class="flex flex-col items-center px-6 py-4 bg-yellow-500 rounded-lg">
								<span class="text-3xl font-bold text-white">{{ formatRating(movie()!.voteAverage || 0) }}/10</span>
								<span class="text-sm text-white/80 font-medium">TMDb</span>
							</div>
							<div class="flex flex-col items-center px-6 py-4 bg-blue-600 rounded-lg">
								<span class="text-3xl font-bold text-white">{{ formatVoteCount(movie()!.voteCount || 0) }}</span>
								<span class="text-sm text-white/80 font-medium">Votes</span>
							</div>
						</div>
					} @else {
						<p class="text-gray-500 dark:text-gray-400">No ratings available</p>
					}
				</section>

				<!-- Crew -->
				<section class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
					<div class="flex items-center gap-2 mb-4">
						<i class="ph ph-users text-2xl text-pink-600 dark:text-pink-400" aria-hidden="true"></i>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'DETAILS.CAST' | translate }}</h3>
					</div>
					<div class="grid gap-4">
						@if (movie()!.Director) {
							<div class="flex flex-col p-4 bg-gray-300 dark:bg-gray-700 rounded-lg border-l-4 border-pink-500">
								<span class="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">{{ 'DETAILS.DIRECTOR' | translate }}</span>
								<span class="text-gray-900 dark:text-white font-medium">{{ movie()!.Director }}</span>
							</div>
						}
						@if (movie()!.Writer) {
							<div class="flex flex-col p-4 bg-gray-300 dark:bg-gray-700 rounded-lg border-l-4 border-pink-500">
								<span class="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">{{ 'DETAILS.WRITER' | translate }}</span>
								<span class="text-gray-900 dark:text-white font-medium">{{ movie()!.Writer }}</span>
							</div>
						}
						@if (movie()!.Actors) {
							<div class="flex flex-col p-4 bg-gray-300 dark:bg-gray-700 rounded-lg border-l-4 border-pink-500">
								<span class="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">{{ 'DETAILS.CAST' | translate }}</span>
								<span class="text-gray-900 dark:text-white font-medium">{{ movie()!.Actors }}</span>
							</div>
						}
						@if (!movie()!.Director && !movie()!.Writer && !movie()!.Actors) {
							<p class="text-gray-500 dark:text-gray-400">{{ 'DETAILS.NO_CREW' | translate }}</p>
						}
					</div>
				</section>

				<!-- Additional Info -->
				<section class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
					<div class="flex items-center gap-2 mb-4">
						<i class="ph ph-info text-2xl text-indigo-600 dark:text-indigo-400" aria-hidden="true"></i>
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ 'DETAILS.ADDITIONAL_INFO' | translate }}</h3>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						@if (movie()!.Released) {
							<div class="flex flex-col p-4 bg-gray-300 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500">
								<span class="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">{{ 'DETAILS.RELEASE_DATE' | translate }}</span>
								<span class="text-gray-900 dark:text-white font-medium">{{ movie()!.Released }}</span>
							</div>
						}
						@if (movie()!.imdbID) {
							<div class="flex flex-col p-4 bg-gray-300 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500">
								<span class="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase">{{ 'DETAILS.IMDB' | translate }}</span>
								<span class="text-gray-900 dark:text-white font-medium">{{ movie()!.imdbID }}</span>
							</div>
						}
					</div>
				</section>
			}

			<!-- No movie found -->
			@if (!movie() && !apiService.isLoading() && !apiService.error()) {
				<div class="flex flex-col items-center justify-center p-12 bg-gray-200 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-600">
					<i class="ph ph-film-slate text-6xl text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true"></i>
					<p class="text-xl text-gray-700 dark:text-gray-300 mb-6">{{ 'APP.NO_RESULTS' | translate }}</p>
					<button 
						[routerLink]="['/movies']" 
						class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
					>
						<i class="ph ph-arrow-left mr-2" aria-hidden="true"></i>{{ 'DETAILS.BACK_TO_SEARCH' | translate }}
					</button>
				</div>
			}
		</div>
	`,
	styles: [
		`
		@keyframes fadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}
		@keyframes fadeOut {
			from { opacity: 1; }
			to { opacity: 0; }
		}
		@keyframes zoomIn {
			from { opacity: 0; transform: scale(0.9); }
			to { opacity: 1; transform: scale(1); }
		}
		@keyframes slideInLeft {
			from { opacity: 0; transform: translateX(-20px); }
			to { opacity: 1; transform: translateX(0); }
		}
		@keyframes slideInRight {
			from { opacity: 0; transform: translateX(20px); }
			to { opacity: 1; transform: translateX(0); }
		}
		@keyframes fadeInUp {
			from { opacity: 0; transform: translateY(10px); }
			to { opacity: 1; transform: translateY(0); }
		}
		@keyframes imageFade {
			0% { opacity: 0; }
			30% { opacity: 0; }
			100% { opacity: 1; }
		}
		.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
		.animate-fade-out { animation: fadeOut 0.2s ease-out forwards; }
		.animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
		.animate-slide-in-left { animation: slideInLeft 0.3s ease-out forwards; }
		.animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
		.animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
		.animate-fade-in-out { animation: imageFade 0.25s ease-out forwards; }
	`,
	],
})
export class MovieDetailPage implements OnInit {
	private route = inject(ActivatedRoute);

	apiService = inject(MoviesApiService);
	private favoritesService = inject(FavoritesService);

	// Keyboard listener for modal navigation
	@HostListener('window:keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		if (this.showImageModal()) {
			if (event.key === 'ArrowLeft') {
				this.prevImage();
				event.preventDefault();
			} else if (event.key === 'ArrowRight') {
				this.nextImage();
				event.preventDefault();
			} else if (event.key === 'Escape') {
				this.closeImageModal();
			} else if (event.key === 'Tab') {
				// Focus trap: prevent Tab from leaving modal
				event.preventDefault();
			}
		}
	}

	// Signal: movie ID from route params
	private movieId = signal<string | null>(null);

	// Computed: is this movie in favorites?
	isFavorite = computed(() => {
		const movie = this.movie();
		if (!movie) return false;

		// Check IDs directly (works even before refresh)
		const movieId = movie.imdbID?.startsWith('tmdb_') ? movie.imdbID : `tmdb_${movie.imdbID}`;
		return this.favoritesService.isFavorite(movieId);
	});

	// Computed: current movie from service signal
	movie = computed(() => this.apiService.movieDetail());

	// Track hover state for icon change
	isHovering = signal(false);

	// Poster for background (updated when movie loads)
	heroPoster = signal<string>('');

	onHover(hovering: boolean) {
		this.isHovering.set(hovering);
	}

	// Backdrops for scenes section
	backdrops = computed(() => this.apiService.movieBackdrops());

	// Image modal state
	showImageModal = signal(false);
	currentImageIndex = signal(0);
	isClosing = signal(false);
	imageKey = signal(0); // Trigger for image change animation
	slideDirection = signal<'left' | 'right' | null>('right'); // Direction for slide animation

	// Backdrops for scenes section (only first 8)
	sceneBackdrops = computed(() => this.backdrops().slice(0, 8));

	// Open image modal at specific index
	openImageModal(index: number) {
		this.currentImageIndex.set(index);
		this.isClosing.set(false);
		this.imageKey.set(0); // Reset animation
		this.showImageModal.set(true);

		// Focus the modal container for keyboard navigation
		setTimeout(() => {
			const modal = document.querySelector('.image-modal-container') as HTMLElement;
			if (modal) {
				modal.focus();
			}
		}, 100);
	}

	// Close image modal with animation
	closeImageModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.showImageModal.set(false);
			this.isClosing.set(false);
		}, 200); // Wait for animation to complete
	}

	// Navigate to previous image
	prevImage() {
		if (this.currentImageIndex() > 0) {
			// Reset direction to trigger animation
			this.slideDirection.set(null);
			setTimeout(() => {
				this.slideDirection.set('right');
				this.currentImageIndex.update((i) => i - 1);
			}, 50);
		}
	}

	// Navigate to next image
	nextImage() {
		if (this.currentImageIndex() < this.backdrops().length - 1) {
			// Reset direction to trigger animation
			this.slideDirection.set(null);
			setTimeout(() => {
				this.slideDirection.set('left');
				this.currentImageIndex.update((i) => i + 1);
			}, 50);
		}
	}

	constructor() {
		// Effect: when movieId changes, fetch movie details
		effect(() => {
			const id = this.movieId();
			if (id) {
				this.apiService.getMovieDetail(id).subscribe({
					error: (err) => console.error('Failed to load movie:', err),
				});
				// Fetch backdrops with dedup
				this.apiService.getMovieImages(id).subscribe((response) => {
					const backdrops: Array<{ file_path: string }> = response.backdrops || [];
					// Filter unique by file_path using a Map
					const seen = new Set<string>();
					const unique = backdrops.filter((b: { file_path: string }) => {
						if (seen.has(b.file_path)) return false;
						seen.add(b.file_path);
						return true;
					});
					// Keep 20 for modal, but only display 8 in scenes
					this.apiService.movieBackdrops.set(unique.slice(0, 20));
				});
			}
		});

		// Effect: update hero poster when movie loads
		effect(() => {
			const m = this.movie();
			if (m?.Poster) {
				this.heroPoster.set(m.Poster);
			}
		});

		// Effect: prevent body scroll when modal is open
		effect(() => {
			if (typeof document !== 'undefined') {
				if (this.showImageModal()) {
					document.body.style.overflow = 'hidden';
				} else {
					document.body.style.overflow = '';
				}
			}
		});
	}

	ngOnInit(): void {
		// Extract movie ID from route params
		this.route.params.subscribe((params) => {
			const id = params['id'];
			if (id) {
				this.movieId.set(id);
			}
		});
	}

	/**
	 * Toggle favorite status for current movie
	 */
	toggleFavorite(): void {
		const movie = this.movie();
		if (!movie) return;

		if (this.isFavorite()) {
			this.favoritesService.removeFavorite(movie.imdbID);
		} else {
			this.favoritesService.addFavorite(movie);
		}
	}

	/**
	 * Split genres string into array
	 * Handles "Genre1, Genre2, Genre3" format from API
	 */
	getGenres(): string[] {
		const movie = this.movie();
		if (!movie?.Genre) return [];

		return movie.Genre.split(',')
			.map((g) => g.trim())
			.filter((g) => g.length > 0);
	}

	/**
	 * Format rating to 1 decimal place
	 * TMDb ratings are 0-10 scale
	 */
	formatRating(rating: number): string {
		return rating.toFixed(1);
	}

	/**
	 * Format vote count with K/M suffixes for readability
	 * e.g., 1234 → "1.2K", 1234567 → "1.2M"
	 */
	formatVoteCount(count: number): string {
		if (count >= 1000000) {
			return (count / 1000000).toFixed(1) + 'M';
		} else if (count >= 1000) {
			return (count / 1000).toFixed(1) + 'K';
		}
		return count.toString();
	}
}
