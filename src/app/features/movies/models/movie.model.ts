/**
 * Movie domain models and types
 * Supports OMDb API responses + local app enhancements
 */

/** OMDb API Movie object (from search response) */
export interface OmdbMovie {
	Title: string;
	Year: string;
	imdbID: string;
	Type: 'movie' | 'series' | 'episode';
	Poster: string; // URL or 'N/A'
	voteAverage?: number; // TMDb rating (0-10 scale)
}

/** OMDb search response */
export interface OmdbSearchResponse {
	Search: OmdbMovie[];
	totalResults: string; // number as string
	Response: 'True' | 'False';
	Error?: string;
}

/** OMDb detailed movie object (from detail endpoint) */
export interface Movie extends OmdbMovie {
	Plot?: string;
	Genre?: string;
	Actors?: string;
	Director?: string;
	Writer?: string;
	Runtime?: string;
	imdbRating?: string; // e.g. "8.8"
	Metascore?: string;
	Released?: string;
	Rated?: string;
	Response?: 'True' | 'False'; // OMDb response status
	Error?: string; // OMDb error message
	// TMDb ratings
	voteAverage?: number; // e.g. 7.8 (0-10 scale)
	voteCount?: number; // e.g. 25392
	// TMDb collection (for sequels/prequels)
	belongs_to_collection?: BelongsToCollection;
	[key: string]: any; // OMDb can return other fields
}

/** App-level favorite movie (stored in service) */
export interface FavoriteMovie {
	imdbID: string;
	title: string;
	poster: string;
	year: string;
	addedAt: number; // timestamp
}

/**
 * Video from TMDb /movie/{id}/videos endpoint
 * Filtered to YouTube site and Trailer/Teaser/Clip types
 */
export interface Video {
	id: string;
	key: string; // YouTube video ID
	name: string;
	site: string;
	type: string;
}

/**
 * Collection movie from TMDb /collection/{id} endpoint
 */
export interface CollectionMovie {
	id: number;
	title: string;
	originalTitle: string;
	releaseDate: string;
	posterPath: string | null;
	backdropPath: string | null;
}

/**
 * Collection from TMDb /collection/{id} endpoint
 */
export interface Collection {
	id: number;
	name: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	parts: CollectionMovie[];
}

/**
 * TMDb collection reference (embedded in Movie response)
 */
export interface BelongsToCollection {
	id: number;
	name: string;
	posterPath: string | null;
	backdropPath: string | null;
}
