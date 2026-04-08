/**
 * Movie Models — TypeScript interfaces for type safety
 * Defines contracts for OMDb API responses and local app extensions
 */

/**
 * OmdbMovie — Single movie object from OMDb API search response
 * Represents minimal movie data returned by OMDb search endpoint
 */
export interface OmdbMovie {
	/** Movie title as returned by OMDb */
	Title: string;

	/** Release year (string format: "2010") */
	Year: string;

	/** Unique OMDb identifier (e.g., "tt1375666" for Inception) */
	imdbID: string;

	/** Content type: 'movie', 'series', or 'episode' */
	Type: 'movie' | 'series' | 'episode';

	/** URL to movie poster image, or 'N/A' if unavailable */
	Poster: string;
}

/**
 * MovieSearchResponse — OMDb API response for search endpoint
 * Contains array of matching movies and pagination metadata
 */
export interface MovieSearchResponse {
	/** Array of matching movies from search query */
	Search: OmdbMovie[];

	/** Total number of results matching query (string: "347") */
	totalResults: string;

	/** OMDb response status: 'True' (success) or 'False' (error) */
	Response: 'True' | 'False';
}

/**
 * ApiErrorResponse — OMDb API error response format
 * HTTP 200 with Response: 'False' indicates API-level error (not network)
 * Distinguishes from network errors (timeouts, offline, etc.)
 */
export interface ApiErrorResponse {
	/** Always 'False' for error responses */
	Response: 'False';

	/** Human-readable error message from OMDb API */
	Error: string;
}

/**
 * Movie — Extended movie interface with full details
 * Combines OmdbMovie + additional fields from detail endpoint
 * Used for detail page display and local app state
 */
export interface Movie extends OmdbMovie {
	/** Movie plot/synopsis (full text from detail endpoint) */
	Plot?: string;

	/** Comma-separated genre tags (e.g., "Action, Sci-Fi, Thriller") */
	Genre?: string;

	/** Runtime in minutes format (e.g., "148 min") */
	Runtime?: string;

	/** Comma-separated list of actors/cast (e.g., "Leonardo DiCaprio, Marion Cotillard") */
	Actors?: string;

	/** Film director name(s) */
	Director?: string;

	/** IMDb rating on 10-point scale (e.g., "8.8") */
	imdbRating?: string;

	/**
	 * Dynamic properties for compatibility with API responses
	 * Allows additional fields from OMDb API without interface updates
	 */
	[key: string]: any;
}

/**
 * FilterChange — Event payload for filter changes
 * Emitted by FilterPanelComponent when user changes genre or year selection
 */
export interface FilterChange {
	/** Selected genre (e.g., "Action"), or null to clear filter */
	genre: string | null;

	/** Selected year (e.g., 2010), or null to clear filter */
	year: number | null;
}
