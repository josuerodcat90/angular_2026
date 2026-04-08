/**
 * Barrel export for movies feature
 * Centralizes all public API exports for convenient importing
 *
 * Usage:
 *   import { MoviesApiService, FavoritesService, type Movie } from 'app/features/movies';
 */

// Models
export * from './models';

// Services
export { MoviesApiService, FavoritesService } from './services';

// Components
export { MovieSliderComponent } from './components/movie-slider.component';
