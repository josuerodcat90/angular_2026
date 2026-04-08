import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { OmdbMovie, OmdbSearchResponse, Movie } from '../models/movie.model';

/**
 * TMDb API Service
 * Handles all movie search and detail operations via The Movie Database API
 * Exposes results via signals for reactive components
 */
@Injectable({ providedIn: 'root' })
export class MoviesApiService {
	private http = inject(HttpClient);

	// Configuration
	private readonly API_KEY = environment.tmdbApiKey;
	private readonly BASE_URL = environment.tmdbBaseUrl;
	private readonly IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

	// Signals for reactive state
	searchResults = signal<OmdbMovie[]>([]);
	movieDetail = signal<Movie | null>(null);
	currentPage = signal(1);
	totalResults = signal(0);
	isLoading = signal(false);
	error = signal<string | null>(null);

	// Trending/popular movies for home page
	trendingMovies = signal<OmdbMovie[]>([]);

	// Computed: has next page?
	hasMorePages = computed(() => {
		const total = this.totalResults();
		const results = this.searchResults().length;
		return results < total && results > 0;
	});

	/**
	 * Search movies by title
	 * Updates signals: searchResults, totalResults, isLoading, error, currentPage
	 */
	search(query: string, page: number = 1): Observable<OmdbSearchResponse> {
		// Early exit for empty query
		if (!query || !query.trim()) {
			this.resetResults();
			return of({ Search: [], totalResults: '0', Response: 'True' });
		}

		this.isLoading.set(true);
		this.error.set(null);

		return this.http
			.get<any>(`${this.BASE_URL}/search/movie`, {
				params: {
					api_key: this.API_KEY,
					query: query.trim(),
					page: page.toString(),
				},
			})
			.pipe(
				tap((response) => {
					if (response.results && response.results.length > 0) {
						// Transform TMDb response to OmdbMovie format
						const movies: OmdbMovie[] = response.results.map((movie: any) => ({
							Title: movie.title,
							Year: movie.release_date?.split('-')[0] || 'N/A',
							imdbID: `tmdb_${movie.id}`, // TMDb uses numeric IDs
							Type: 'movie',
							Poster: movie.poster_path ? `${this.IMAGE_BASE}${movie.poster_path}` : 'N/A',
						}));
						this.searchResults.set(movies);
						this.totalResults.set(response.total_results || 0);
						this.currentPage.set(page);
						this.error.set(null);
					} else {
						this.error.set('No results found');
						this.searchResults.set([]);
						this.totalResults.set(0);
					}
				}),
				catchError((err) => {
					const errorMsg = err?.error?.status_message || err?.message || 'Network error. Please check your connection.';
					this.error.set(errorMsg);
					this.searchResults.set([]);
					return throwError(() => new Error(errorMsg));
				}),
				finalize(() => this.isLoading.set(false)),
			);
	}

	/**
	 * Get full movie details by TMDb ID
	 * Makes 2 parallel calls:
	 * 1. /movie/{id} — base movie details (overview, genres, runtime, etc.)
	 * 2. /movie/{id}/credits — cast and crew (director, actors)
	 */
	getMovieDetail(id: string): Observable<any> {
		if (!id) {
			return throwError(() => new Error('Movie ID required'));
		}

		// Extract TMDb ID from our format (e.g., "tmdb_550" -> "550")
		const tmdbId = id.startsWith('tmdb_') ? id.replace('tmdb_', '') : id;

		this.isLoading.set(true);
		this.error.set(null);

		// Fetch movie details AND credits in parallel
		return forkJoin({
			movie: this.http.get<any>(`${this.BASE_URL}/movie/${tmdbId}`, {
				params: { api_key: this.API_KEY },
			}),
			credits: this.http.get<any>(`${this.BASE_URL}/movie/${tmdbId}/credits`, {
				params: { api_key: this.API_KEY },
			}),
		}).pipe(
			tap(({ movie, credits }) => {
				if (movie && movie.id) {
					// Extract director from credits.crew
					const director =
						credits.crew
							?.filter((p: any) => p.job === 'Director')
							.map((p: any) => p.name)
							.join(', ') || 'N/A';

					// Extract top 5 actors from credits.cast
					const actors =
						credits.cast
							?.slice(0, 5)
							.map((p: any) => p.name)
							.join(', ') || 'N/A';

					// Transform TMDb response to our Movie model
					const movieData: Movie = {
						// Basic info
						Title: movie.title || 'N/A',
						Year: movie.release_date?.split('-')[0] || 'N/A',
						Released: movie.release_date || 'N/A',
						imdbID: `tmdb_${movie.id}`,
						Type: 'movie',
						Poster: movie.poster_path ? `${this.IMAGE_BASE}${movie.poster_path}` : 'N/A',
						Response: 'True',

						// Extended info from TMDb
						Plot: movie.overview || 'N/A',
						Genre: movie.genres?.map((g: any) => g.name).join(', ') || 'N/A',
						Runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
						Rated: movie.adult === true ? 'NC-17' : 'N/A',

						// 📌 Credits from /credits endpoint
						Director: director,
						Actors: actors,

						// 📌 Ratings from /movie/{id} endpoint
						voteAverage: movie.vote_average || 0,
						voteCount: movie.vote_count || 0,
					};
					this.movieDetail.set(movieData);
					this.error.set(null);
				} else {
					throw new Error('Invalid movie data');
				}
			}),
			catchError((err) => {
				const errorMsg = err?.error?.status_message || err?.message || 'Failed to load movie details';
				this.error.set(errorMsg);
				this.movieDetail.set(null);
				return throwError(() => new Error(errorMsg));
			}),
			finalize(() => this.isLoading.set(false)),
		);
	}

	/**
	 * Reset all signals to initial state
	 */
	resetResults(): void {
		this.searchResults.set([]);
		this.movieDetail.set(null);
		this.currentPage.set(1);
		this.totalResults.set(0);
		this.error.set(null);
	}

	/**
	 * Clear error message
	 */
	clearError(): void {
		this.error.set(null);
	}

	/**
	 * Get top rated movies from last year
	 * Used for the home page slider
	 */
	getTopRatedFromLastYear(): Observable<any> {
		const currentYear = new Date().getFullYear();
		const lastYear = currentYear - 1;

		this.isLoading.set(true);

		return this.http
			.get<any>(`${this.BASE_URL}/discover/movie`, {
				params: {
					api_key: this.API_KEY,
					sort_by: 'vote_average.desc',
					'primary_release_date.gte': `${lastYear}-01-01`,
					'primary_release_date.lte': `${lastYear}-12-31`,
					'vote_count.gte': '100', // Minimum votes for quality
					include_adult: 'false',
					page: '1',
				},
			})
			.pipe(
				tap((response) => {
					if (response.results && response.results.length > 0) {
						// Take top 10
						const movies: OmdbMovie[] = response.results.slice(0, 10).map((movie: any) => ({
							Title: movie.title,
							Year: movie.release_date?.split('-')[0] || 'N/A',
							imdbID: `tmdb_${movie.id}`,
							Type: 'movie',
							Poster: movie.poster_path ? `${this.IMAGE_BASE}${movie.poster_path}` : 'N/A',
						}));
						this.trendingMovies.set(movies);
					}
				}),
				catchError((err) => {
					console.error('Failed to load trending movies:', err);
					return of({ results: [] });
				}),
				finalize(() => this.isLoading.set(false)),
			);
	}

	/**
	 * Retry last search
	 * Useful for re-attempting after network errors
	 */
	retry(): void {
		if (this.searchResults().length > 0 || this.currentPage() > 1) {
			// We have cached results, just clear error and retry
			this.clearError();
		}
	}
}
