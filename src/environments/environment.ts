export const environment = {
	production: false,
	tmdbApiKey: import.meta.env['NG_TMDB_API_KEY'] ?? '',
	tmdbBaseUrl: 'https://api.themoviedb.org/3',
};
