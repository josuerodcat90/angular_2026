import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { OmdbMovie, OmdbSearchResponse, Movie } from '../models/movie.model';
import { LanguageService } from '../../../services/language.service';

/**
 * TMDb API Service
 * Handles all movie search and detail operations via The Movie Database API
 * Exposes results via signals for reactive components
 */
@Injectable({ providedIn: 'root' })
export class MoviesApiService {
	private http = inject(HttpClient);
	private languageService = inject(LanguageService);

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

	// Last search query (persists when returning to home)
	lastSearchQuery = signal<string>('');

	// Sort option for search results (default: oldest first)
	sortOption = signal<string>('year-asc');

	// Helper to get language params for TMDB API
	private getLanguageParams(): { [key: string]: string } {
		return { language: this.languageService.getTmdbLanguage() };
	}

	// Transform TMDB response to our Movie model
	private transformMovie(movie: any, credits: any): Movie {
		const director =
			credits?.crew
				?.filter((p: any) => p.job === 'Director')
				.map((p: any) => p.name)
				.join(', ') || 'N/A';

		const actors =
			credits?.cast
				?.slice(0, 5)
				.map((p: any) => p.name)
				.join(', ') || 'N/A';

		return {
			Title: movie.title || 'N/A',
			Year: movie.release_date?.split('-')[0] || 'N/A',
			Released: movie.release_date || 'N/A',
			imdbID: `tmdb_${movie.id}`,
			Type: 'movie',
			Poster: movie.poster_path ? `${this.IMAGE_BASE}${movie.poster_path}` : 'N/A',
			Response: 'True',
			Plot: movie.overview || 'N/A',
			Genre: movie.genres?.map((g: any) => g.name).join(', ') || 'N/A',
			Runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
			Rated: movie.adult === true ? 'NC-17' : 'N/A',
			Director: director,
			Actors: actors,
			voteAverage: movie.vote_average || 0,
			voteCount: movie.vote_count || 0,
		};
	}

	// Sorted search results computed
	sortedSearchResults = computed(() => {
		const movies = this.searchResults();
		const sort = this.sortOption();

		if (!movies.length || sort === 'none') {
			return movies;
		}

		const sorted = [...movies];

		switch (sort) {
			case 'year-desc':
				return sorted.sort((a, b) => {
					const yearA = a.Year === 'N/A' ? 0 : parseInt(a.Year) || 0;
					const yearB = b.Year === 'N/A' ? 0 : parseInt(b.Year) || 0;
					return yearB - yearA;
				});
			case 'year-asc':
				return sorted.sort((a, b) => {
					const yearA = a.Year === 'N/A' ? 0 : parseInt(a.Year) || 0;
					const yearB = b.Year === 'N/A' ? 0 : parseInt(b.Year) || 0;
					return yearA - yearB;
				});
			case 'rating-desc':
				return sorted.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
			case 'rating-asc':
				return sorted.sort((a, b) => (a.voteAverage || 0) - (b.voteAverage || 0));
			case 'title-asc':
				return sorted.sort((a, b) => a.Title.localeCompare(b.Title));
			case 'title-desc':
				return sorted.sort((a, b) => b.Title.localeCompare(a.Title));
			default:
				return movies;
		}
	});

	// Trending/popular movies for home page
	trendingMovies = signal<OmdbMovie[]>([]);

	// Movie backdrops for detail page (scenes)
	movieBackdrops = signal<any[]>([]);

	// Selected year for top rated (default to current year)
	selectedYear = signal(new Date().getFullYear());

	// Reset selected year to current (call this when entering home page)
	resetSelectedYear(): void {
		this.selectedYear.set(new Date().getFullYear());
	}

	// Available years (current year + last 49 years = 50 years total)
	availableYears = computed(() => {
		const currentYear = new Date().getFullYear();
		const years: number[] = [];
		for (let year = currentYear; year >= currentYear - 49; year--) {
			years.push(year);
		}
		return years;
	});

	// Computed: has next page?
	hasMorePages = computed(() => {
		const total = this.totalResults();
		const results = this.searchResults().length;
		return results < total && results > 0;
	});

	/**
	 * Search movies by title
	 * Updates signals: searchResults, totalResults, isLoading, error, currentPage
	 * Stores last search query for persistence across route navigation
	 */
	search(query: string, page: number = 1): Observable<OmdbSearchResponse> {
		// Early exit for empty query
		if (!query || !query.trim()) {
			this.resetResults();
			return of({ Search: [], totalResults: '0', Response: 'True' });
		}

		// Store the search query
		this.lastSearchQuery.set(query.trim());

		this.isLoading.set(true);
		this.error.set(null);

		return this.http
			.get<any>(`${this.BASE_URL}/search/movie`, {
				params: {
					api_key: this.API_KEY,
					query: query.trim(),
					page: page.toString(),
					...this.getLanguageParams(),
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
							voteAverage: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : undefined,
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
	getMovieDetail(id: string, skipSignalUpdate = false): Observable<any> {
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
				params: { api_key: this.API_KEY, ...this.getLanguageParams() },
			}),
			credits: this.http.get<any>(`${this.BASE_URL}/movie/${tmdbId}/credits`, {
				params: { api_key: this.API_KEY, ...this.getLanguageParams() },
			}),
		}).pipe(
			map(({ movie, credits }) => {
				// Transform TMDb response to our Movie model
				const movieData: Movie = this.transformMovie(movie, credits);
				return movieData;
			}),
			tap((movieData) => {
				// Only update signal if not skipped (e.g., for favorites refresh)
				if (!skipSignalUpdate) {
					this.movieDetail.set(movieData);
					this.error.set(null);
				}
			}),
			catchError((err) => {
				const errorMsg = err?.error?.status_message || err?.message || 'Failed to load movie details';
				if (!skipSignalUpdate) {
					this.error.set(errorMsg);
					this.movieDetail.set(null);
				}
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
	 * Clear last search query (called when user clears search)
	 */
	clearLastSearch(): void {
		this.lastSearchQuery.set('');
	}

	/**
	 * Get top rated movies from a specific year
	 * Used for the home page slider
	 */
	getTopRatedFromYear(year: number): Observable<any> {
		this.isLoading.set(true);

		return this.http
			.get<any>(`${this.BASE_URL}/discover/movie`, {
				params: {
					api_key: this.API_KEY,
					sort_by: 'vote_count.desc', // Sort by votes instead of rating for more reliable results
					'primary_release_date.gte': `${year}-01-01`,
					'primary_release_date.lte': `${year}-12-31`,
					'vote_count.gte': '50', // Lower threshold for more results
					include_adult: 'false',
					page: '1',
					...this.getLanguageParams(),
				},
			})
			.pipe(
				tap((response) => {
					if (response.results && response.results.length > 0) {
						// Take top 10 sorted by popularity/votes
						const movies: OmdbMovie[] = response.results.slice(0, 10).map((movie: any) => ({
							Title: movie.title,
							Year: movie.release_date?.split('-')[0] || 'N/A',
							imdbID: `tmdb_${movie.id}`,
							Type: 'movie',
							Poster: movie.poster_path ? `${this.IMAGE_BASE}${movie.poster_path}` : 'N/A',
							voteAverage: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : undefined,
						}));
						this.trendingMovies.set(movies);
					} else {
						// If no results for this year, set empty and don't crash
						this.trendingMovies.set([]);
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
	 * Get top rated movies from last year (backward compatibility)
	 * Used for the home page slider
	 */
	getTopRatedFromLastYear(): Observable<any> {
		return this.getTopRatedFromYear(new Date().getFullYear() - 1);
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

	/**
	 * Get movie images (backdrops, posters, logos)
	 * Returns backdrops for "scenes" feature
	 */
	getMovieImages(id: string): Observable<any> {
		if (!id) {
			return of({ backdrops: [], posters: [], logos: [] });
		}

		// Extract TMDb ID from our format
		const tmdbId = id.startsWith('tmdb_') ? id.replace('tmdb_', '') : id;

		return this.http
			.get<any>(`${this.BASE_URL}/movie/${tmdbId}/images`, {
				params: { api_key: this.API_KEY, ...this.getLanguageParams() },
			})
			.pipe(
				tap(() => {
					// Just return the response, caller handles the data
				}),
				catchError((err) => {
					console.error('Failed to load movie images:', err);
					return of({ backdrops: [], posters: [], logos: [] });
				}),
			);
	}

	/**
	 * Refresh all favorites with current language
	 * Fetches full data for all favorite IDs in parallel
	 * Called by FavoritesPage when language changes
	 */
	refreshFavorites(favoriteIds: string[]): Observable<Movie[]> {
		if (!favoriteIds || favoriteIds.length === 0) {
			return of([]);
		}

		this.isLoading.set(true);
		this.error.set(null);

		// Create parallel requests for all favorites (skip signal update to avoid interfering with view)
		const requests = favoriteIds.map((id) => this.getMovieDetail(id, true));

		return forkJoin(requests).pipe(
			tap({
				next: (movies) => {
					console.log('[API] All movies:', movies?.length);
					this.isLoading.set(false);
				},
				error: (err) => {
					console.error('[API] ForkJoin error:', err);
					this.error.set('Failed to load favorites');
					this.isLoading.set(false);
				},
			}),
			catchError((err) => {
				console.error('[API] Catch error:', err);
				this.error.set('Failed to load favorites');
				this.isLoading.set(false);
				return of([]);
			}),
		);
	}
}
