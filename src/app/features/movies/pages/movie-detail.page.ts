import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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
 * Pattern: Signals with computed derived state
 * - movieId from route params
 * - movie from service signal (populated by API call)
 * - isFavorite computed from FavoritesService
 */
@Component({
	selector: 'app-movie-detail',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
		<div class="movie-detail-container">
			<!-- Header con botón atrás -->
			<div class="detail-header">
				<button class="back-btn" [routerLink]="['/movies']" title="Back to movies">
					← Back
				</button>
				<h1>Movie Details</h1>
				<div class="spacer"></div>
			</div>

			<!-- Loading state -->
			@if (this.apiService.isLoading()) {
				<div class="loading">
					<div class="spinner"></div>
					<p>Loading details...</p>
				</div>
			}

			<!-- Error state -->
			@if (this.apiService.error() && !this.apiService.isLoading()) {
				<div class="error">
					<p>{{ this.apiService.error() }}</p>
					<button (click)="this.apiService.clearError()" class="btn-primary">
						Close
					</button>
				</div>
			}

			<!-- Movie detail content -->
			@if (this.movie() && !this.apiService.isLoading()) {
				<div class="detail-wrapper">
					<!-- HERO SECTION: Poster + Título + Favoritos -->
					<div class="hero-section">
						<div class="poster-section">
							<img
								[src]="this.movie()!.Poster"
								[alt]="this.movie()!.Title"
								class="poster-image"
							/>
							<button
								(click)="this.toggleFavorite()"
								[class.is-favorite]="this.isFavorite()"
								class="btn-favorite"
								[title]="this.isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
							>
								{{ this.isFavorite() ? '♥ Favorited' : '♡ Add to Favorites' }}
							</button>
						</div>

						<div class="title-section">
							<h2 class="movie-title">{{ this.movie()!.Title }}</h2>
							
							<!-- Info General: Año, Tipo, Duración, Rated -->
							<div class="quick-info">
								@if (this.movie()!.Year) {
									<div class="info-badge">
										<span class="icon">📅</span>
										<span>{{ this.movie()!.Year }}</span>
									</div>
								}
								@if (this.movie()!.Type) {
									<div class="info-badge">
										<span class="icon">🎬</span>
										<span>{{ this.movie()!.Type | uppercase }}</span>
									</div>
								}
								@if (this.movie()!.Runtime) {
									<div class="info-badge">
										<span class="icon">⏱️</span>
										<span>{{ this.movie()!.Runtime }}</span>
									</div>
								}
								@if (this.movie()!.Rated) {
									<div class="info-badge rated">
										<span class="icon">🔞</span>
										<span>{{ this.movie()!.Rated }}</span>
									</div>
								}
							</div>
						</div>
					</div>

					<!-- MAIN CONTENT -->
					<div class="detail-content">
						<!-- SECTION 1: Plot/Synopsis -->
						@if (this.movie()!.Plot) {
							<section class="detail-section plot-section">
								<div class="section-header">
									<h3>📖 Plot</h3>
								</div>
								<div class="section-content">
									<p class="plot-text">{{ this.movie()!.Plot }}</p>
								</div>
							</section>
						}

						<!-- SECTION 2: Genres -->
						@if (this.movie()!.Genre) {
							<section class="detail-section genre-section">
								<div class="section-header">
									<h3>🎭 Genres</h3>
								</div>
								<div class="section-content">
									<div class="tags">
										@for (genre of this.getGenres(); track genre) {
											<span class="tag">{{ genre }}</span>
										}
									</div>
								</div>
							</section>
						}

						<!-- SECTION 3: Ratings -->
						<section class="detail-section ratings-section">
							<div class="section-header">
								<h3>⭐ Ratings</h3>
							</div>
							<div class="section-content ratings-grid">
								@if (this.movie()!.voteAverage) {
									<div class="rating-card">
										<div class="rating-value">{{ this.formatRating(this.movie()!.voteAverage || 0) }}/10</div>
										<div class="rating-label">TMDb</div>
									</div>
									<div class="rating-card votes-card">
										<div class="votes-badge">{{ this.formatVoteCount(this.movie()!.voteCount || 0) }}</div>
										<div class="rating-label">Votes</div>
									</div>
								}
								@if (!this.movie()!.voteAverage) {
									<div class="no-data">
										<p>No ratings available</p>
									</div>
								}
							</div>
						</section>

						<!-- SECTION 4: Crew -->
						<section class="detail-section crew-section">
							<div class="section-header">
								<h3>👥 Crew</h3>
							</div>
							<div class="section-content crew-grid">
								@if (this.movie()!.Director) {
									<div class="crew-card">
										<div class="crew-role">🎥 Director</div>
										<div class="crew-names">{{ this.movie()!.Director }}</div>
									</div>
								}
								@if (this.movie()!.Writer) {
									<div class="crew-card">
										<div class="crew-role">✍️ Writer</div>
										<div class="crew-names">{{ this.movie()!.Writer }}</div>
									</div>
								}
								@if (this.movie()!.Actors) {
									<div class="crew-card full-width">
										<div class="crew-role">🎭 Cast</div>
										<div class="crew-names actors-list">{{ this.movie()!.Actors }}</div>
									</div>
								}
								@if (!this.movie()!.Director && !this.movie()!.Writer && !this.movie()!.Actors) {
									<div class="no-data">
										<p>No crew information available</p>
									</div>
								}
							</div>
						</section>

						<!-- SECTION 5: Additional Info -->
						<section class="detail-section additional-section">
							<div class="section-header">
								<h3>ℹ️ Additional Info</h3>
							</div>
							<div class="section-content additional-grid">
								@if (this.movie()!.Released) {
									<div class="info-item">
										<span class="info-label">Release Date:</span>
										<span class="info-value">{{ this.movie()!.Released }}</span>
									</div>
								}
								@if (this.movie()!.Type) {
									<div class="info-item">
										<span class="info-label">Type:</span>
										<span class="info-value">{{ this.movie()!.Type }}</span>
									</div>
								}
								@if (this.movie()!.imdbID) {
									<div class="info-item">
										<span class="info-label">IMDb ID:</span>
										<span class="info-value">{{ this.movie()!.imdbID }}</span>
									</div>
								}
								@if (!this.movie()!.Released && !this.movie()!.Type && !this.movie()!.imdbID) {
									<div class="no-data">
										<p>No additional information available</p>
									</div>
								}
							</div>
						</section>
					</div>
				</div>
			}

			<!-- No movie found -->
			@if (!this.movie() && !this.apiService.isLoading() && !this.apiService.error()) {
				<div class="no-movie">
					<p>Movie not found</p>
					<button [routerLink]="['/movies']" class="btn-primary">
						Back to Search
					</button>
				</div>
			}
		</div>
	`,
	styles: `
		.movie-detail-container {
			padding: 2rem;
			max-width: 1400px;
			margin: 0 auto;
			background: var(--gradient-bg);
			min-height: 100vh;
		}

		.detail-header {
			display: flex;
			align-items: center;
			gap: 1rem;
			margin-bottom: 2rem;
			background: var(--color-bg-primary);
			padding: 1.5rem;
			border-radius: 8px;
			box-shadow: 0 2px 8px var(--color-shadow);
		}

		.back-btn {
			padding: 0.6rem 1.2rem;
			background: var(--color-accent);
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 1rem;
			transition: all 0.3s;
			font-weight: 600;
		}

		.back-btn:hover {
			background: var(--color-accent-hover);
			box-shadow: 0 2px 8px var(--color-shadow);
		}

		.detail-header h1 {
			margin: 0;
			flex: 1;
			text-align: center;
			color: var(--color-text-primary);
		}

		.spacer {
			width: 60px;
		}

		.loading,
		.error,
		.no-movie {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 1.5rem;
			padding: 4rem 2rem;
			border-radius: 12px;
			text-align: center;
			background: var(--color-bg-primary);
		}

		.error {
			background: color-mix(in srgb, var(--color-error) 10%, var(--color-bg-primary));
			color: var(--color-error);
			border-left: 5px solid var(--color-error);
		}

		.no-movie {
			background: var(--color-bg-secondary);
			border: 2px dashed var(--color-border);
		}

		.spinner {
			width: 50px;
			height: 50px;
			border: 4px solid var(--color-border);
			border-top-color: var(--color-accent);
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		.detail-wrapper {
			display: flex;
			flex-direction: column;
			gap: 2rem;
		}

		/* HERO SECTION */
		.hero-section {
			display: grid;
			grid-template-columns: 320px 1fr;
			gap: 3rem;
			background: var(--color-bg-primary);
			padding: 2.5rem;
			border-radius: 12px;
			box-shadow: 0 4px 16px var(--color-shadow);
			align-items: start;
		}

		.poster-section {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			align-items: center;
		}

		.poster-image {
			width: 100%;
			height: auto;
			max-width: 320px;
			border-radius: 8px;
			box-shadow: 0 8px 24px var(--color-shadow-heavy);
			object-fit: cover;
		}

		.btn-favorite {
			width: 100%;
			padding: 0.9rem 1.5rem;
			background: var(--color-text-tertiary);
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			font-size: 1rem;
			font-weight: 600;
			transition: all 0.3s;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.btn-favorite:hover {
			background: var(--color-text-secondary);
			transform: translateY(-2px);
			box-shadow: 0 4px 12px var(--color-shadow);
		}

		.btn-favorite.is-favorite {
			background: linear-gradient(135deg, #e91e63, #c2185b);
		}

		.btn-favorite.is-favorite:hover {
			background: linear-gradient(135deg, #c2185b, #ad1457);
		}

		.title-section {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.movie-title {
			margin: 0;
			font-size: 2.5rem;
			color: var(--color-text-primary);
			line-height: 1.2;
			font-weight: 700;
		}

		.quick-info {
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;
		}

		.info-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			padding: 0.7rem 1.2rem;
			background: var(--color-bg-secondary);
			border-radius: 20px;
			border-left: 3px solid var(--color-accent);
			font-weight: 600;
			color: var(--color-text-primary);
			font-size: 0.95rem;
		}

		.info-badge.rated {
			border-left-color: var(--color-warning);
		}

		.info-badge .icon {
			font-size: 1.2rem;
		}

		/* MAIN CONTENT SECTIONS */
		.detail-content {
			display: flex;
			flex-direction: column;
			gap: 2rem;
		}

		.detail-section {
			background: var(--color-bg-primary);
			border-radius: 12px;
			overflow: hidden;
			box-shadow: 0 2px 12px var(--color-shadow);
			transition: transform 0.3s, box-shadow 0.3s;
		}

		.detail-section:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 16px var(--color-shadow-heavy);
		}

		.section-header {
			padding: 1.5rem;
			border-bottom: 2px solid var(--color-border);
			background: var(--color-bg-secondary);
		}

		.section-header h3 {
			margin: 0;
			font-size: 1.4rem;
			color: var(--color-text-primary);
			font-weight: 700;
		}

		.section-content {
			padding: 1.5rem;
		}

		/* PLOT SECTION */
		.plot-section .section-header {
			border-bottom-color: var(--color-warning);
			background: color-mix(in srgb, var(--color-warning) 5%, var(--color-bg-secondary));
		}

		.plot-text {
			margin: 0;
			line-height: 1.8;
			color: var(--color-text-secondary);
			font-size: 1.05rem;
			text-align: justify;
		}

		/* GENRE SECTION */
		.genre-section .section-header {
			border-bottom-color: var(--color-success);
			background: color-mix(in srgb, var(--color-success) 5%, var(--color-bg-secondary));
		}

		.tags {
			display: flex;
			gap: 0.8rem;
			flex-wrap: wrap;
		}

		.tag {
			display: inline-block;
			padding: 0.6rem 1.2rem;
			background: linear-gradient(135deg, var(--color-success), #45a049);
			color: white;
			border-radius: 20px;
			font-weight: 600;
			font-size: 0.9rem;
		}

		/* RATINGS SECTION */
		.ratings-section .section-header {
			border-bottom-color: var(--color-warning);
			background: color-mix(in srgb, var(--color-warning) 5%, var(--color-bg-secondary));
		}

		.ratings-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 1.5rem;
		}

		.rating-card {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 1.5rem;
			background: linear-gradient(135deg, var(--color-warning), #ff9800);
			border-radius: 8px;
			color: white;
			text-align: center;
		}

		.rating-value {
			font-size: 2.5rem;
			font-weight: 700;
			margin-bottom: 0.5rem;
		}

		.rating-label {
			font-size: 0.9rem;
			text-transform: uppercase;
			letter-spacing: 1px;
			opacity: 0.9;
			font-weight: 600;
		}

		.rating-scale {
			font-size: 0.85rem;
			opacity: 0.8;
		}

		.votes-card {
			background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		}

		.votes-badge {
			font-size: 2rem;
			font-weight: 700;
			margin-bottom: 0.5rem;
		}

		/* CREW SECTION */
		.crew-section .section-header {
			border-bottom-color: #e91e63;
			background: color-mix(in srgb, #e91e63 5%, var(--color-bg-secondary));
		}

		.crew-grid {
			display: grid;
			gap: 1.5rem;
		}

		.crew-card {
			padding: 1.5rem;
			background: var(--color-bg-secondary);
			border-left: 4px solid #e91e63;
			border-radius: 4px;
		}

		.crew-card.full-width {
			grid-column: 1 / -1;
		}

		.crew-role {
			font-size: 0.9rem;
			color: var(--color-text-tertiary);
			text-transform: uppercase;
			letter-spacing: 0.5px;
			font-weight: 700;
			margin-bottom: 0.8rem;
		}

		.crew-names {
			color: var(--color-text-primary);
			line-height: 1.6;
			font-weight: 500;
		}

		.actors-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		/* ADDITIONAL INFO SECTION */
		.additional-section .section-header {
			border-bottom-color: #3f51b5;
			background: color-mix(in srgb, #3f51b5 5%, var(--color-bg-secondary));
		}

		.additional-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1.5rem;
		}

		.info-item {
			padding: 1rem;
			background: var(--color-bg-secondary);
			border-left: 4px solid #3f51b5;
			border-radius: 4px;
		}

		.info-label {
			display: block;
			font-weight: 700;
			color: var(--color-text-tertiary);
			text-transform: uppercase;
			font-size: 0.85rem;
			margin-bottom: 0.5rem;
			letter-spacing: 0.5px;
		}

		.info-value {
			display: block;
			color: var(--color-text-primary);
			font-size: 1rem;
			word-break: break-word;
		}

		.no-data {
			padding: 2rem;
			text-align: center;
			color: var(--color-text-tertiary);
		}

		.no-data p {
			margin: 0;
		}

		.btn-primary {
			padding: 0.8rem 1.5rem;
			background: var(--color-accent);
			color: white;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			font-size: 1rem;
			font-weight: 600;
			transition: all 0.3s;
		}

		.btn-primary:hover {
			background: var(--color-accent-hover);
			box-shadow: 0 4px 12px var(--color-shadow);
		}

		/* RESPONSIVE */
		@media (max-width: 1024px) {
			.hero-section {
				grid-template-columns: 1fr;
				gap: 2rem;
			}

			.movie-title {
				font-size: 2rem;
			}
		}

		@media (max-width: 768px) {
			.movie-detail-container {
				padding: 1rem;
			}

			.hero-section {
				padding: 1.5rem;
			}

			.movie-title {
				font-size: 1.8rem;
			}

			.quick-info {
				flex-direction: column;
			}

			.info-badge {
				width: 100%;
				justify-content: center;
			}

			.ratings-grid {
				grid-template-columns: 1fr;
			}

			.crew-card {
				padding: 1rem;
			}

			.additional-grid {
				grid-template-columns: 1fr;
			}
		}

		@media (max-width: 480px) {
			.movie-detail-container {
				padding: 0.5rem;
			}

			.detail-header {
				flex-direction: column;
				gap: 0.5rem;
			}

			.detail-header h1 {
				font-size: 1.2rem;
			}

			.movie-title {
				font-size: 1.5rem;
			}

			.poster-image {
				max-width: 200px;
			}

			.section-header h3 {
				font-size: 1.1rem;
			}

			.section-content {
				padding: 1rem;
			}
		}
	`,
})
export class MovieDetailPage implements OnInit {
	private route = inject(ActivatedRoute);

	apiService = inject(MoviesApiService);
	private favoritesService = inject(FavoritesService);

	// Signal: movie ID from route params
	private movieId = signal<string | null>(null);

	// Computed: is this movie in favorites?
	isFavorite = computed(() => {
		const movie = this.movie();
		const favorites = this.favoritesService.favorites();

		if (!movie) return false;

		return favorites.some((fav) => fav.imdbID === movie.imdbID);
	});

	// Computed: current movie from service signal
	movie = computed(() => this.apiService.movieDetail());

	constructor() {
		// Effect: when movieId changes, fetch movie details
		effect(() => {
			const id = this.movieId();
			if (id) {
				this.apiService.getMovieDetail(id).subscribe({
					error: (err) => console.error('Failed to load movie:', err),
				});
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
