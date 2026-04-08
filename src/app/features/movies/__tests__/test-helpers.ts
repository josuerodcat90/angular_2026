import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from 'vitest';

/**
 * Test Helper Functions for Movies Feature
 * Provides utilities for testing services with mocked HTTP and localStorage
 */

/**
 * Setup HttpClient mocking for service tests
 * Returns TestBed for further configuration and HttpTestingController
 */
export function setupHttpTestingModule() {
	TestBed.configureTestingModule({
		imports: [HttpClientTestingModule],
	});

	const httpMock = TestBed.inject(HttpTestingController);
	return { TestBed, httpMock };
}

/**
 * Mock localStorage for favorites tests
 * Stores data in-memory for test isolation
 */
export class MockLocalStorage {
	private store: Map<string, string> = new Map();

	getItem(key: string): string | null {
		return this.store.get(key) ?? null;
	}

	setItem(key: string, value: string): void {
		this.store.set(key, value);
	}

	removeItem(key: string): void {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	key(index: number): string | null {
		const keys = Array.from(this.store.keys());
		return keys[index] ?? null;
	}

	get length(): number {
		return this.store.size;
	}
}

/**
 * Setup localStorage mock for tests
 * Replaces global localStorage with MockLocalStorage
 * Call in beforeEach() to isolate localStorage state
 */
export function setupStorageMock(): MockLocalStorage {
	const mockStorage = new MockLocalStorage();

	// Replace global localStorage with mock
	Object.defineProperty(window, 'localStorage', {
		value: mockStorage,
		writable: true,
	});

	return mockStorage;
}

/**
 * Create mock TMDb movie for testing
 */
export function createMockMovie(overrides?: Partial<any>) {
	return {
		id: 550,
		title: 'Inception',
		release_date: '2010-07-16',
		poster_path: '/9gk7adHYeDMwWQTzNuRi2pl8W9d.jpg',
		overview: 'A thief who steals corporate secrets through dream-sharing technology...',
		genre_ids: [28, 878, 53],
		vote_average: 8.8,
		vote_count: 25392,
		original_language: 'en',
		popularity: 42.5,
		...overrides,
	};
}

/**
 * Create mock TMDb search response
 */
export function createMockSearchResponse(movieCount = 3) {
	return {
		page: 1,
		results: Array.from({ length: movieCount }, (_, i) => ({
			id: 550 + i,
			title: `Movie ${i + 1}`,
			release_date: `${2020 - i}-01-01`,
			poster_path: `/poster${i + 1}.jpg`,
			overview: `Overview for movie ${i + 1}`,
			genre_ids: [28, 878],
			vote_average: 7.5 + i * 0.1,
			vote_count: 1000 + i * 100,
			original_language: 'en',
			popularity: 35.5 + i * 5,
		})),
		total_results: 347,
		total_pages: 18,
	};
}

/**
 * Create mock TMDb API error response
 */
export function createMockApiError(message: string) {
	return {
		status_code: 34,
		status_message: message,
		success: false,
	};
}

/**
 * Helper to verify HTTP request was made with expected parameters
 */
export function expectHttpRequest(httpMock: HttpTestingController, method: string, urlPattern: RegExp | string) {
	const req = httpMock.expectOne((req) => {
		if (typeof urlPattern === 'string') {
			return req.url.includes(urlPattern);
		}
		return urlPattern.test(req.url);
	});

	expect(req.request.method).toBe(method);
	return req;
}

/**
 * Cleanup function for after each test
 */
export function cleanupHttpMock(httpMock: HttpTestingController) {
	httpMock.verify();
}
