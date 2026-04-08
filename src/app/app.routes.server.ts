import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
	{
		path: 'movies/:id',
		renderMode: RenderMode.Server, // Dynamic route: render on-demand
	},
	{
		path: '**',
		renderMode: RenderMode.Prerender, // Static routes: prerender at build time
	},
];
