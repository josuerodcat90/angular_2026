import { Routes } from '@angular/router';
import { MoviesListPage } from './features/movies/pages/movies-list.page';
import { MovieDetailPage } from './features/movies/pages/movie-detail.page';
import { FavoritesPage } from './features/movies/pages/favorites.page';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/movies',
		pathMatch: 'full',
	},
	{
		path: 'movies',
		component: MoviesListPage,
	},
	{
		path: 'movies/:id',
		component: MovieDetailPage,
	},
	{
		path: 'favorites',
		component: FavoritesPage,
	},
];
