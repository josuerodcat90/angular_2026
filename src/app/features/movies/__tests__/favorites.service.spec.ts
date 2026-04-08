import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FavoritesService } from '../services/favorites.service';
import { createMockMovie, setupStorageMock, MockLocalStorage } from './test-helpers';
import type { Movie } from '../models';

/**
 * FavoritesService Tests — Signal-based favorites management
 * Tests: signal initialization, CRUD operations, localStorage sync, edge cases
 */
describe('FavoritesService', () => {
	let service: FavoritesService;
	let mockStorage: MockLocalStorage;

	beforeEach(() => {
		// Setup mock localStorage before service creation
		mockStorage = setupStorageMock();

		TestBed.configureTestingModule({
			providers: [FavoritesService],
		});

		service = TestBed.inject(FavoritesService);
	});

	afterEach(() => {
		mockStorage.clear();
	});

	describe('Service Initialization', () => {
		it('should create service', () => {
			expect(service).toBeDefined();
		});

		it('should initialize favorites signal as empty array', () => {
			expect(service.favorites()).toEqual([]);
		});

		it('should initialize from empty localStorage', () => {
			const freshService = new FavoritesService();
			expect(freshService.favorites()).toEqual([]);
		});

		it('should load from localStorage if data exists', () => {
			const movies: Movie[] = [createMockMovie({ imdbID: 'tt1' }), createMockMovie({ imdbID: 'tt2' })];

			mockStorage.setItem('movies-favorites', JSON.stringify(movies));

			// Create new service instance to trigger load from storage
			const freshService = new FavoritesService();
			expect(freshService.favorites()).toHaveLength(2);
		});

		it('should handle corrupted localStorage gracefully', () => {
			mockStorage.setItem('movies-favorites', 'invalid json {');

			const freshService = new FavoritesService();
			expect(freshService.favorites()).toEqual([]);
		});

		it('should handle missing localStorage gracefully', () => {
			mockStorage.clear();
			const freshService = new FavoritesService();
			expect(freshService.favorites()).toEqual([]);
		});
	});

	describe('Add Favorite', () => {
		it('should add movie to favorites signal', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });
			service.addFavorite(movie);

			expect(service.favorites()).toHaveLength(1);
			expect(service.favorites()[0].imdbID).toBe('tt1');
		});

		it('should add multiple movies in order', () => {
			const movie1 = createMockMovie({ imdbID: 'tt1' });
			const movie2 = createMockMovie({ imdbID: 'tt2' });

			service.addFavorite(movie1);
			service.addFavorite(movie2);

			expect(service.favorites()).toHaveLength(2);
			expect(service.favorites()[0].imdbID).toBe('tt1');
			expect(service.favorites()[1].imdbID).toBe('tt2');
		});

		it('should not add duplicate if already favorited', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });

			service.addFavorite(movie);
			service.addFavorite(movie); // Try to add again

			expect(service.favorites()).toHaveLength(1);
		});

		it('should persist to localStorage on add', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });
			service.addFavorite(movie);

			const stored = mockStorage.getItem('movies-favorites');
			expect(stored).toBeDefined();
			const parsed = JSON.parse(stored!);
			expect(parsed).toHaveLength(1);
			expect(parsed[0].imdbID).toBe('tt1');
		});
	});

	describe('Remove Favorite', () => {
		it('should remove movie by ID', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });
			service.addFavorite(movie);

			service.removeFavorite('tt1');

			expect(service.favorites()).toEqual([]);
		});

		it('should handle removing non-existent movie (idempotent)', () => {
			service.removeFavorite('tt999');

			expect(service.favorites()).toEqual([]);
		});

		it('should remove only the specified movie', () => {
			const movie1 = createMockMovie({ imdbID: 'tt1' });
			const movie2 = createMockMovie({ imdbID: 'tt2' });

			service.addFavorite(movie1);
			service.addFavorite(movie2);
			service.removeFavorite('tt1');

			expect(service.favorites()).toHaveLength(1);
			expect(service.favorites()[0].imdbID).toBe('tt2');
		});

		it('should persist to localStorage on remove', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });
			service.addFavorite(movie);
			service.removeFavorite('tt1');

			const stored = mockStorage.getItem('movies-favorites');
			const parsed = JSON.parse(stored!);
			expect(parsed).toHaveLength(0);
		});
	});

	describe('Toggle Favorite', () => {
		it('should add movie if not favorited', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });

			service.toggleFavorite(movie);

			expect(service.favorites()).toHaveLength(1);
			expect(service.favorites()[0].imdbID).toBe('tt1');
		});

		it('should remove movie if already favorited', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });

			service.addFavorite(movie);
			expect(service.favorites()).toHaveLength(1);

			service.toggleFavorite(movie);
			expect(service.favorites()).toHaveLength(0);
		});
	});

	describe('Is Favorite', () => {
		it('should return true for favorited movie', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });
			service.addFavorite(movie);

			expect(service.isFavorite('tt1')).toBe(true);
		});

		it('should return false for non-favorited movie', () => {
			expect(service.isFavorite('tt999')).toBe(false);
		});

		it('should return false for empty favorites', () => {
			expect(service.isFavorite('tt1')).toBe(false);
		});
	});

	describe('Computed Favorite Count', () => {
		it('should compute favorite count', () => {
			expect(service.favoriteCount()).toBe(0);

			const movie1 = createMockMovie({ imdbID: 'tt1' });
			const movie2 = createMockMovie({ imdbID: 'tt2' });

			service.addFavorite(movie1);
			expect(service.favoriteCount()).toBe(1);

			service.addFavorite(movie2);
			expect(service.favoriteCount()).toBe(2);

			service.removeFavorite('tt1');
			expect(service.favoriteCount()).toBe(1);
		});
	});

	describe('Clear Favorites', () => {
		it('should clear all favorites', () => {
			service.addFavorite(createMockMovie({ imdbID: 'tt1' }));
			service.addFavorite(createMockMovie({ imdbID: 'tt2' }));

			service.clearFavorites();

			expect(service.favorites()).toEqual([]);
		});

		it('should clear localStorage on clear', () => {
			service.addFavorite(createMockMovie({ imdbID: 'tt1' }));

			service.clearFavorites();

			const stored = mockStorage.getItem('movies-favorites');
			const parsed = JSON.parse(stored!);
			expect(parsed).toEqual([]);
		});
	});

	describe('localStorage Error Handling', () => {
		it('should handle localStorage.setItem throwing error', () => {
			// Mock setItem to throw
			const originalSetItem = mockStorage.setItem;
			mockStorage.setItem = () => {
				throw new Error('QuotaExceededError');
			};

			// Should not crash app, just log warning
			expect(() => {
				service.addFavorite(createMockMovie({ imdbID: 'tt1' }));
			}).not.toThrow();

			// Restore
			mockStorage.setItem = originalSetItem;
		});

		it('should handle localStorage unavailable gracefully', () => {
			// Replace localStorage with object that throws
			Object.defineProperty(window, 'localStorage', {
				value: {
					getItem: () => null,
					setItem: () => {
						throw new Error('localStorage disabled');
					},
					removeItem: () => {},
					clear: () => {},
				},
				writable: true,
			});

			// Create service — should not crash
			expect(() => {
				const newService = new FavoritesService();
				newService.addFavorite(createMockMovie({ imdbID: 'tt1' }));
			}).not.toThrow();

			// Restore mock
			mockStorage.setItem = (key, value) => {
				mockStorage['store']?.set(key, value);
			};
		});
	});

	describe('Signal Reactivity', () => {
		it('should allow component to subscribe to signal changes', () => {
			const movie = createMockMovie({ imdbID: 'tt1' });

			// Simulate component reading signal
			expect(service.favorites()).toEqual([]);

			service.addFavorite(movie);

			// Component's effect/computed would re-evaluate
			expect(service.favorites()).toHaveLength(1);
		});

		it('should maintain signal consistency across multiple operations', () => {
			const m1 = createMockMovie({ imdbID: 'tt1' });
			const m2 = createMockMovie({ imdbID: 'tt2' });
			const m3 = createMockMovie({ imdbID: 'tt3' });

			service.addFavorite(m1);
			service.addFavorite(m2);
			service.addFavorite(m3);
			service.removeFavorite('tt2');

			expect(service.favorites()).toHaveLength(2);
			expect(service.isFavorite('tt1')).toBe(true);
			expect(service.isFavorite('tt2')).toBe(false);
			expect(service.isFavorite('tt3')).toBe(true);
		});
	});
});
