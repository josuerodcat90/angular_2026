import { describe, it, expect } from 'vitest';
import type { OmdbMovie, MovieSearchResponse, ApiErrorResponse, Movie } from '../models';

/**
 * Models test suite — verifies TypeScript interface contracts
 * Tests interface definitions and type guards
 */
describe('Movie Models', () => {
	describe('OmdbMovie interface', () => {
		it('should define OmdbMovie with required fields', () => {
			const movie: OmdbMovie = {
				Title: 'Inception',
				Year: '2010',
				imdbID: 'tt1375666',
				Type: 'movie',
				Poster: 'https://m.media-amazon.com/images/M/...',
			};

			expect(movie.Title).toBe('Inception');
			expect(movie.Year).toBe('2010');
			expect(movie.imdbID).toBe('tt1375666');
			expect(movie.Type).toBe('movie');
			expect(movie.Poster).toBeDefined();
		});

		it('should allow Type to be series or episode', () => {
			const tvShow: OmdbMovie = {
				Title: 'Breaking Bad',
				Year: '2008',
				imdbID: 'tt0903747',
				Type: 'series',
				Poster: 'url',
			};

			const episode: OmdbMovie = {
				Title: 'Pilot',
				Year: '2008',
				imdbID: 'tt0959621',
				Type: 'episode',
				Poster: 'url',
			};

			expect(tvShow.Type).toBe('series');
			expect(episode.Type).toBe('episode');
		});

		it('should allow Poster to be N/A', () => {
			const movie: OmdbMovie = {
				Title: 'Unknown Movie',
				Year: '2020',
				imdbID: 'ttXXXXXXX',
				Type: 'movie',
				Poster: 'N/A',
			};

			expect(movie.Poster).toBe('N/A');
		});
	});

	describe('MovieSearchResponse interface', () => {
		it('should define MovieSearchResponse with Search array', () => {
			const response: MovieSearchResponse = {
				Search: [
					{
						Title: 'Inception',
						Year: '2010',
						imdbID: 'tt1375666',
						Type: 'movie',
						Poster: 'https://...',
					},
				],
				totalResults: '347',
				Response: 'True',
			};

			expect(response.Search).toHaveLength(1);
			expect(response.totalResults).toBe('347');
			expect(response.Response).toBe('True');
		});

		it('should handle empty search results', () => {
			const response: MovieSearchResponse = {
				Search: [],
				totalResults: '0',
				Response: 'True',
			};

			expect(response.Search).toEqual([]);
			expect(response.totalResults).toBe('0');
		});

		it('should allow Response to be False', () => {
			const errorResponse: MovieSearchResponse = {
				Search: [],
				totalResults: '0',
				Response: 'False',
			};

			expect(errorResponse.Response).toBe('False');
		});
	});

	describe('ApiErrorResponse interface', () => {
		it('should define ApiErrorResponse with error message', () => {
			const error: ApiErrorResponse = {
				Response: 'False',
				Error: 'Request limit reached',
			};

			expect(error.Response).toBe('False');
			expect(error.Error).toBe('Request limit reached');
		});

		it('should handle various error messages', () => {
			const errors = ['No API key provided!', 'Incorrect IMDb ID.', 'Movie not found!', 'Too many requests.'];

			errors.forEach((msg) => {
				const error: ApiErrorResponse = {
					Response: 'False',
					Error: msg,
				};
				expect(error.Error).toBe(msg);
			});
		});
	});

	describe('Movie interface (extended)', () => {
		it('should extend OmdbMovie with additional fields', () => {
			const movie: Movie = {
				// OmdbMovie fields
				Title: 'Inception',
				Year: '2010',
				imdbID: 'tt1375666',
				Type: 'movie',
				Poster: 'https://...',

				// Extended fields
				Plot: 'A thief who steals corporate secrets...',
				Genre: 'Action, Sci-Fi, Thriller',
				Runtime: '148 min',
				Actors: 'Leonardo DiCaprio, Marion Cotillard',
				Director: 'Christopher Nolan',
				imdbRating: '8.8',
			};

			expect(movie.Title).toBe('Inception');
			expect(movie.Plot).toBe('A thief who steals corporate secrets...');
			expect(movie.imdbRating).toBe('8.8');
		});

		it('should allow Movie to have optional extended fields', () => {
			const minimalMovie: Movie = {
				Title: 'Test',
				Year: '2020',
				imdbID: 'tt0000001',
				Type: 'movie',
				Poster: 'N/A',
			};

			expect(minimalMovie['Plot']).toBeUndefined();
			expect(minimalMovie['Genre']).toBeUndefined();
			expect(minimalMovie['Runtime']).toBeUndefined();
		});

		it('should allow dynamic additional properties via [key: string]', () => {
			const movie: Movie = {
				Title: 'Inception',
				Year: '2010',
				imdbID: 'tt1375666',
				Type: 'movie',
				Poster: 'url',
				customField: 'custom value',
				anotherField: 123,
			};

			expect(movie['customField']).toBe('custom value');
			expect(movie['anotherField']).toBe(123);
		});
	});

	describe('Type safety', () => {
		it('should compile with correct types', () => {
			// Just compile, don't throw errors
			const movie: OmdbMovie = {
				Title: 'Test',
				Year: '2020',
				imdbID: 'tt0000001',
				Type: 'movie',
				Poster: 'url',
			};

			const response: MovieSearchResponse = {
				Search: [movie],
				totalResults: '1',
				Response: 'True',
			};

			expect(response.Search[0].imdbID).toBe(movie.imdbID);
		});
	});
});
