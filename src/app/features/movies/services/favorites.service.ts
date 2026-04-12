import { Injectable, computed, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Movie } from '../models';

/**
 * Sort options for favorites
 */
export type SortOption = 'year-desc' | 'year-asc' | 'rating-desc' | 'rating-asc' | 'title-asc' | 'title-desc' | 'none';

/**
 * FavoritesService — Signal-based favorites management with localStorage sync
 *
 * Responsibilities:
 * - Manage user's favorite movies as signal
 * - Persistent storage via localStorage
 * - CRUD operations: add, remove, toggle, query
 * - Effect automatically syncs signal to localStorage
 * - Sorting options: by year or rating
 *
 * Architecture:
 * - favorites: Signal<Movie[]> — source of truth in memory
 * - sortedFavorites: computed signal with sorting applied
 * - sortOption: signal to control sort order
 * - effect() watches signal, persists to localStorage on change
 * - loadFromStorage() restores on initialization
 *
 * Note: Gracefully handles:
 * - Private browsing mode (localStorage disabled)
 * - Storage quota exceeded
 * - Corrupted JSON in storage
 */
@Injectable({
	providedIn: 'root',
})
export class FavoritesService {
	// Configuration
	private readonly STORAGE_KEY = 'movies-favorites';

	// Platform detection for SSR compatibility
	private platformId = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.platformId);

	// Signal: reactive favorites list
	private favoritesSignal = signal<Movie[]>([]);

	// Sort option signal
	sortOption = signal<SortOption>('none');

	// Public accessor (allows both read and write)
	get favorites(): typeof this.favoritesSignal {
		return this.favoritesSignal;
	}

	// Computed: sorted favorites
	sortedFavorites = computed(() => {
		const movies = this.favoritesSignal();
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

	// Computed: favorite count
	favoriteCount = computed(() => this.favoritesSignal().length);

	constructor() {
		// Load saved favorites from localStorage if in browser
		if (this.isBrowser) {
			const stored = this.loadFromStorage();
			this.favoritesSignal.set(stored);
		}

		// Setup effect to persist signal to localStorage (only in browser)
		effect(() => {
			const fav = this.favoritesSignal();
			if (this.isBrowser) {
				this.persistToStorage(fav);
			}
		});
	}

	/**
	 * Add movie to favorites
	 * Idempotent: no duplicate if already favorited
	 */
	addFavorite(movie: Movie): void {
		this.favorites.update((current) => {
			// Check for duplicate
			if (current.some((m) => m.imdbID === movie.imdbID)) {
				return current; // Already favorited, no change
			}
			return [...current, movie];
		});
	}

	/**
	 * Remove movie from favorites by ID
	 * Idempotent: no error if not in favorites
	 */
	removeFavorite(id: string): void {
		this.favorites.update((current) => current.filter((m) => m.imdbID !== id));
	}

	/**
	 * Toggle favorite: add if not, remove if already favorited
	 */
	toggleFavorite(movie: Movie): void {
		if (this.isFavorite(movie.imdbID)) {
			this.removeFavorite(movie.imdbID);
		} else {
			this.addFavorite(movie);
		}
	}

	/**
	 * Check if movie is favorited
	 */
	isFavorite(id: string): boolean {
		return this.favorites().some((m) => m.imdbID === id);
	}

	/**
	 * Clear all favorites
	 */
	clearFavorites(): void {
		this.favorites.set([]);
	}

	/**
	 * Load favorites from localStorage on service initialization
	 * Returns empty array if storage unavailable or corrupted
	 */
	private loadFromStorage(): Movie[] {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) {
				return [];
			}

			const parsed = JSON.parse(stored);
			// Validate it's an array
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			// Handle parse error, missing storage, or localStorage disabled
			// Graceful degradation: start with empty favorites
			if (error instanceof SyntaxError) {
				console.warn('Corrupted favorites in localStorage:', error);
			} else {
				console.warn('localStorage unavailable:', error);
			}
			return [];
		}
	}

	/**
	 * Persist favorites signal to localStorage
	 * Called by effect() whenever signal changes
	 * Gracefully handles storage errors
	 */
	private persistToStorage(movies: Movie[]): void {
		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(movies));
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'QuotaExceededError') {
					console.warn('localStorage quota exceeded, favorites not persisted:', error);
				} else if (error.message.includes('disabled')) {
					console.warn('localStorage disabled (private browsing?), favorites in-memory only:', error);
				} else {
					console.warn('localStorage write error:', error);
				}
			}
			// Graceful degradation: app continues, favorites in-memory but not persisted
		}
	}
}
