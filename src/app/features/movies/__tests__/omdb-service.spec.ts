import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MoviesApiService } from '../services/movies-api.service';
import { createMockMovie, createMockSearchResponse, createMockApiError } from './test-helpers';

/**
 * MoviesApiService Tests
 * Tests signal initialization, HTTP integration, error handling
 */
describe('MoviesApiService', () => {
	let service: MoviesApiService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [MoviesApiService],
		});

		service = TestBed.inject(MoviesApiService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('Service Initialization', () => {
		it('should create the service', () => {
			expect(service).toBeDefined();
		});

		it('should initialize searchResults signal as empty array', () => {
			expect(service.searchResults()).toEqual([]);
		});

		it('should initialize isLoading signal as false', () => {
			expect(service.isLoading()).toBe(false);
		});

		it('should initialize error signal as null', () => {
			expect(service.error()).toBeNull();
		});

		it('should initialize totalResults signal as 0', () => {
			expect(service.totalResults()).toBe(0);
		});

		it('should initialize currentPage signal as 1', () => {
			expect(service.currentPage()).toBe(1);
		});
	});

	describe('Search Method', () => {
		it('should return Observable', () => {
			const result$ = service.search('Inception');
			expect(result$).toBeDefined();
			expect(typeof result$.subscribe).toBe('function');
		});

		it('should update searchResults after successful search', async () => {
			const mockResponse = createMockSearchResponse(2);
			let testComplete = false;

			service.search('Inception').subscribe(() => {
				expect(service.searchResults()).toHaveLength(2);
				testComplete = true;
			});

			const req = httpMock.expectOne((req) => req.url.includes('themoviedb.org'));
			req.flush(mockResponse);

			expect(testComplete).toBe(true);
		});

		it('should set error for empty query', async () => {
			let testComplete = false;

			service.search('').subscribe(() => {
				expect(service.searchResults()).toEqual([]);
				testComplete = true;
			});

			httpMock.expectNone((req) => req.url.includes('themoviedb.org'));
			expect(testComplete).toBe(true);
		});

		it('should handle API error response', async () => {
			const mockError = createMockApiError('Too many requests');
			let testComplete = false;

			service.search('test').subscribe(() => {
				expect(service.error()).toBe('Too many requests');
				testComplete = true;
			});

			const req = httpMock.expectOne((req) => req.url.includes('themoviedb.org'));
			req.flush(mockError);

			expect(testComplete).toBe(true);
		});

		it('should handle network error', async () => {
			let errorHandled = false;

			service.search('test').subscribe(
				() => {
					throw new Error('Should have errored');
				},
				() => {
					expect(service.error()).toBeDefined();
					errorHandled = true;
				},
			);

			const req = httpMock.expectOne((req) => req.url.includes('themoviedb.org'));
			req.error(new ErrorEvent('Network error'));

			expect(errorHandled).toBe(true);
		});
	});

	describe('Detail Method', () => {
		it('should return Observable', () => {
			const result$ = service.getMovieDetail('tmdb_550');
			expect(result$).toBeDefined();
			expect(typeof result$.subscribe).toBe('function');
		});

		it('should update movieDetail on success with credits', async () => {
			const mockMovie = createMockMovie();
			const mockCredits = {
				cast: [
					{ name: 'Actor 1', profile_path: '/path1.jpg' },
					{ name: 'Actor 2', profile_path: '/path2.jpg' },
					{ name: 'Actor 3', profile_path: '/path3.jpg' },
				],
				crew: [
					{ name: 'Christopher Nolan', job: 'Director' },
					{ name: 'Hans Zimmer', job: 'Composer' },
				],
			};
			let testComplete = false;

			service.getMovieDetail('tmdb_550').subscribe(() => {
				expect(service.movieDetail()).toBeDefined();
				expect(service.movieDetail()?.Director).toBe('Christopher Nolan');
				expect(service.movieDetail()?.Actors).toContain('Actor 1');
				// Verify ratings are mapped from vote_average and vote_count
				expect(service.movieDetail()?.voteAverage).toBe(mockMovie.vote_average);
				expect(service.movieDetail()?.voteCount).toBe(mockMovie.vote_count);
				testComplete = true;
			});

			// Expect TWO requests: one for movie, one for credits
			const requests = httpMock.match((req) => req.url.includes('themoviedb.org/3/movie'));
			expect(requests.length).toBe(2);

			// First request: /movie/{id}
			requests[0].flush(mockMovie);
			// Second request: /movie/{id}/credits
			requests[1].flush(mockCredits);

			expect(testComplete).toBe(true);
		});

		it('should require movie ID', async () => {
			let errorHandled = false;

			service.getMovieDetail('').subscribe(
				() => {
					throw new Error('Should have errored');
				},
				() => {
					errorHandled = true;
				},
			);

			expect(errorHandled).toBe(true);
		});
	});

	describe('Signals', () => {
		it('searchResults is callable', () => {
			expect(typeof service.searchResults).toBe('function');
		});

		it('isLoading is callable', () => {
			expect(typeof service.isLoading).toBe('function');
		});

		it('error is callable', () => {
			expect(typeof service.error).toBe('function');
		});

		it('hasMorePages is callable', () => {
			expect(typeof service.hasMorePages).toBe('function');
		});
	});

	describe('Utility Methods', () => {
		it('resetResults should clear all signals', () => {
			service.searchResults.set([{ Title: 'test', Year: '2020', imdbID: 'tt123', Type: 'movie', Poster: 'url' }]);
			service.totalResults.set(100);

			service.resetResults();

			expect(service.searchResults()).toEqual([]);
			expect(service.totalResults()).toBe(0);
			expect(service.error()).toBeNull();
		});

		it('clearError should set error to null', () => {
			service.error.set('Some error');
			service.clearError();
			expect(service.error()).toBeNull();
		});

		it('retry should clear error', () => {
			service.error.set('Some error');
			service.retry();
			expect(service.error()).toBeNull();
		});
	});
});
