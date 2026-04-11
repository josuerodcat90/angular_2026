import { Injectable, computed, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import type { Movie } from '../models';
import { LanguageService } from '../../../services/language.service';
import { MoviesApiService } from './movies-api.service';

/**
 * Sort options for favorites
 */
export type SortOption = 'year-desc' | 'year-asc' | 'rating-desc' | 'rating-asc' | 'title-asc' | 'title-desc' | 'none';

export interface FavoriteId {
	/** TMDb ID in format 'tmdb_12345' */
	tmdbId: string;
	/** When added */
	addedAt: number;
}

/**
 * FavoritesService — Signal-based favorites management with localStorage sync
 *
 * Responsibilities:
 * - Manage favorite movie IDs as signal (not full objects for i18n support)
 * - Persistent storage via localStorage
 * - CRUD operations: add, remove, toggle, query
 * - refreshFavorites() method to fetch current data from API when language changes
 * - Emits 'languageChanged' event to trigger refresh
 *
 * Architecture:
 * - favoriteIds: Signal<FavoriteId[]> — only IDs stored
 * - favorites: computed from favoriteIds (initially empty, populated via refreshFavorites)
 * - refreshFavorites(): fetches full movie data from API
 *
 * i18n approach (Option C):
 * - Only IDs stored in localStorage
 * - On language change, call refreshFavorites() to fetch fresh data in new language
 * - No fetch on init — only when needed
 */
@Injectable({
	providedIn: 'root',
})
export class FavoritesService {
	// Configuration
	private readonly STORAGE_KEY = 'movies-favorites-ids';

	// Platform detection for SSR compatibility
	private platformId = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.platformId);

	// Services
	private moviesApi = inject(MoviesApiService);
	private languageService = inject(LanguageService);

	// Signal: reactive favorite IDs only (for persistence)
	private favoriteIdsSignal = signal<FavoriteId[]>([]);

	// Signal: full movie objects (populated via refreshFavorites)
	private favoritesDataSignal = signal<Movie[]>([]);

	// Loading state for refresh operation
	isRefreshing = signal(false);

	// Sort option signal
	sortOption = signal<SortOption>('none');

	// Event emitter for language change (components listen and call refresh)
	languageChanged = new Subject<void>();

	// Public accessor for IDs (read-only)
	get favoriteIds(): typeof this.favoriteIdsSignal {
		return this.favoriteIdsSignal;
	}

	// Computed: favorites with data (populated via refreshFavorites)
	favorites = computed(() => this.favoritesDataSignal());

	// Computed: sorted favorites
	sortedFavorites = computed(() => {
		const movies = this.favoritesDataSignal();
		const sort = this.sortOption();

		if (sort === 'none') {
			return movies;
		}

		return [...movies].sort((a, b) => {
			switch (sort) {
				case 'year-desc':
					return (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0);
				case 'year-asc':
					return (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0);
				case 'rating-desc':
					return (b.voteAverage || 0) - (a.voteAverage || 0);
				case 'rating-asc':
					return (a.voteAverage || 0) - (b.voteAverage || 0);
				case 'title-asc':
					return a.Title.localeCompare(b.Title);
				case 'title-desc':
					return b.Title.localeCompare(a.Title);
				default:
					return 0;
			}
		});
	});

	// Computed: favorite count (from IDs)
	favoriteCount = computed(() => this.favoriteIdsSignal().length);

	constructor() {
		// Load saved favorite IDs from localStorage if in browser
		if (this.isBrowser) {
			const stored = this.loadFromStorage();
			this.favoriteIdsSignal.set(stored);
		}

		// Setup effect to persist IDs to localStorage (not full objects)
		effect(() => {
			const ids = this.favoriteIdsSignal();
			if (this.isBrowser) {
				this.persistToStorage(ids);
			}
		});

		// Listen to language changes and refresh favorites data
		if (this.isBrowser) {
			this.languageService.languageChanged$.subscribe(() => {
				this.refreshFavoritesData();
			});

			// Initial load: if we have favorites but no data, fetch them once
			// Using setTimeout to avoid calling during constructor
			const ids = this.favoriteIdsSignal();
			if (ids.length > 0) {
				setTimeout(() => this.refreshFavoritesData(), 0);
			}
		}
	}

	/**
	 * Refresh favorites data from API in current language
	 * Called internally when language changes
	 * MERGEs with existing data (doesn't lose newly added favorites)
	 */
	private refreshFavoritesData(): void {
		const ids = this.favoriteIdsSignal();
		if (ids.length === 0) {
			this.favoritesDataSignal.set([]);
			return;
		}

		this.isRefreshing.set(true);
		this.moviesApi.refreshFavorites(ids.map((f) => f.tmdbId)).subscribe({
			next: (newMovies) => {
				const validNewMovies = newMovies.filter((m) => m && m.imdbID);

				// Get existing IDs that are already in the data signal
				const existingData = this.favoritesDataSignal();
				const existingIds = new Set(existingData.map((m) => m.imdbID));

				// Merge: keep existing + add new
				const merged = [...existingData, ...validNewMovies.filter((m) => !existingIds.has(m.imdbID))];

				this.favoritesDataSignal.set(merged);
				this.isRefreshing.set(false);
			},
			error: (err) => {
				console.error('Failed to refresh favorites:', err);
				this.isRefreshing.set(false);
			},
		});
	}

	/**
	 * Add movie to favorites
	 * Stores only the ID for i18n support, plus the Movie object for immediate display
	 */
	addFavorite(movie: Movie): void {
		const tmdbId = movie.imdbID?.startsWith('tmdb_') ? movie.imdbID : `tmdb_${movie.imdbID}`;

		this.favoriteIdsSignal.update((current) => {
			// Check for duplicate
			if (current.some((m) => m.tmdbId === tmdbId)) {
				return current;
			}
			return [...current, { tmdbId, addedAt: Date.now() }];
		});

		// Also add to data signal for immediate display
		this.favoritesDataSignal.update((current) => {
			if (current.some((m) => m.imdbID === tmdbId)) {
				return current;
			}
			return [...current, movie];
		});
	}

	/**
	 * Remove movie from favorites by ID
	 */
	removeFavorite(id: string): void {
		const tmdbId = id.startsWith('tmdb_') ? id : `tmdb_${id}`;
		this.favoriteIdsSignal.update((current) => current.filter((m) => m.tmdbId !== tmdbId));
		// Remove from both signals
		this.favoritesDataSignal.update((current) =>
			current.filter((m) => {
				const mId = m.imdbID?.startsWith('tmdb_') ? m.imdbID : `tmdb_${m.imdbID}`;
				return mId !== tmdbId;
			}),
		);
	}

	/**
	 * Toggle favorite: add if not, remove if already favorited
	 */
	toggleFavorite(movie: Movie): void {
		const tmdbId = movie.imdbID?.startsWith('tmdb_') ? movie.imdbID : `tmdb_${movie.imdbID}`;
		if (this.isFavorite(tmdbId)) {
			this.removeFavorite(tmdbId);
		} else {
			this.addFavorite(movie);
		}
	}

	/**
	 * Check if movie is favorited
	 */
	isFavorite(id: string): boolean {
		const tmdbId = id.startsWith('tmdb_') ? id : `tmdb_${id}`;
		return this.favoriteIdsSignal().some((m) => m.tmdbId === tmdbId);
	}

	/**
	 * Clear all favorites
	 */
	clearFavorites(): void {
		this.favoriteIdsSignal.set([]);
		this.favoritesDataSignal.set([]);
	}

	/**
	 * Set movie data after fetching from API
	 * Called by MoviesApiService after refreshFavorites()
	 */
	setFavoritesData(movies: Movie[]): void {
		this.favoritesDataSignal.set(movies);
	}

	/**
	 * Get IDs for refresh
	 */
	getIdsForRefresh(): string[] {
		return this.favoriteIdsSignal().map((f) => f.tmdbId);
	}

	/**
	 * Load favorite IDs from localStorage
	 * Returns empty array if storage unavailable or corrupted
	 */
	private loadFromStorage(): FavoriteId[] {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) {
				return [];
			}

			const parsed = JSON.parse(stored);
			// Handle both old format (array of strings) and new format (array of FavoriteId)
			if (Array.isArray(parsed)) {
				// Check if old format (just strings)
				if (parsed.length > 0 && typeof parsed[0] === 'string') {
					// Migrate from old format
					return parsed.map((id: string) => ({
						tmdbId: id.startsWith('tmdb_') ? id : `tmdb_${id}`,
						addedAt: Date.now(),
					}));
				}
				return parsed;
			}
			return [];
		} catch (error) {
			if (error instanceof SyntaxError) {
				console.warn('Corrupted favorites in localStorage:', error);
			}
			return [];
		}
	}

	/**
	 * Persist favorite IDs to localStorage
	 */
	private persistToStorage(ids: FavoriteId[]): void {
		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'QuotaExceededError') {
					console.warn('localStorage quota exceeded, favorites not persisted:', error);
				} else if (error.message.includes('disabled')) {
					console.warn('localStorage disabled (private browsing?), favorites in-memory only:', error);
				}
			}
		}
	}
}
