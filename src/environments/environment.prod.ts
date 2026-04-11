export const environment = {
	production: true,
	tmdbApiKey: import.meta.env['TMDB_API_KEY'] ?? '',
	tmdbBaseUrl: 'https://api.themoviedb.org/3',
};
