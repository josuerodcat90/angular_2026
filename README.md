# 🎬 Movie DB - Angular Dashboard

A movie search and discovery dashboard built with Angular 21 as a learning project for developers coming from React.

![Angular](https://img.shields.io/badge/Angular-21.1.0-DD0031?style=flat&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)
![Bun](https://img.shields.io/badge/Bun-1.3.9-000000?style=flat&logo=bun)

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Configure API keys (see below)
# Create src/environments/environment.ts with your TMDb API key

# 3. Start development server
bun run start

# 4. Open http://localhost:4200
```

## ⚙️ Prerequisites

- **Node.js**: 18+
- **Bun**: Latest (recommended) or npm/yarn
- **TMDb API Key**: Free at [themoviedb.org](https://www.themoviedb.org/settings/api)

## 🔑 API Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  tmdbApiKey: 'YOUR_API_KEY_HERE',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  tmdbApiKey: 'YOUR_API_KEY_HERE',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
};
```

> **Note**: Get your free TMDb API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start dev server (http://localhost:4200) |
| `bun run build` | Production build + format |
| `bun run watch` | Watch mode for development |
| `bun run test` | Run tests with Vitest |
| `bun run format` | Format code with Biome |
| `bun run serve:ssr` | Serve SSR production build |

## 🎯 Features

- **Movie Search**: Search movies by title using TMDb API
- **Top Rated Slider**: Display top 10 rated movies from last year on home page
- **Movie Details**: Full movie information including plot, genres, ratings, cast
- **Favorites**: Save favorite movies with localStorage persistence
- **Dark Mode**: Toggle between light and dark themes
- **SSR Support**: Server-side rendering for better SEO and performance
- **Responsive**: Works on mobile, tablet, and desktop

## 🛠 Tech Stack

- **Framework**: Angular 21 (Standalone Components, Signals)
- **Styling**: SCSS with CSS variables for theming
- **State**: Angular Signals + Services
- **API**: TMDb (The Movie Database)
- **Build**: Angular CLI + Bun
- **Linting**: Biome
- **Testing**: Vitest

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Shared components
│   │   └── app-header.component.ts
│   ├── features/
│   │   └── movies/
│   │       ├── components/   # Movie-specific components
│   │       │   ├── movie-card.component.ts
│   │       │   ├── movie-grid.component.ts
│   │       │   ├── movie-slider.component.ts
│   │       │   └── search-bar.component.ts
│   │       ├── models/      # TypeScript interfaces
│   │       ├── pages/       # Page components
│   │       │   ├── favorites.page.ts
│   │       │   ├── movie-detail.page.ts
│   │       │   └── movies-list.page.ts
│   │       └── services/    # Business logic
│   │           ├── favorites.service.ts
│   │           └── movies-api.service.ts
│   ├── services/            # App-wide services
│   │   └── theme.service.ts
│   ├── app.config.ts        # App configuration
│   └── app.routes.ts        # Routing configuration
├── environments/            # Environment config
└── styles.scss              # Global styles
```

## 🎨 Key Concepts for React Devs

| React | Angular |
|-------|---------|
| `useState()` | `signal()` |
| `useEffect()` | `effect()` or OnPush + signals |
| `useMemo()` | `computed()` |
| `.map()` | `@for()` control flow |
| JSX | Templates with `{{ }}` |
| Redux/Zustand | Services + Signals |

## 🔍 Key Files

- **`movies-api.service.ts`**: TMDb API integration with signals
- **`favorites.service.ts`**: localStorage persistence with SSR guards
- **`theme.service.ts`**: Dark mode with CSS variables
- **`movie-slider.component.ts`**: Horizontal scrollable slider
- **`movie-grid.component.ts`**: Responsive movie grid

## 📝 Development Notes

### SSR Compatibility
Services using `localStorage` must check `isPlatformBrowser()`:
```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  if (isPlatformBrowser(this.platformId)) {
    // Safe to use localStorage
  }
}
```

### Signals Usage
- Use `signal()` for writable state
- Use `.asReadonly()` for public read-only access
- Use `computed()` for derived state

### Animations
- View Transitions via `withViewTransitions()` in router config
- CSS keyframe animations for component-level effects

## 📄 License

MIT - Built for learning purposes

---

Built with ❤️ for learning Angular coming from React