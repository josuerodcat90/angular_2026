# 🎬 Movie Search - Angular Dashboard

A modern movie search and discovery dashboard built with Angular 21, featuring a sleek UI with Tailwind CSS, interactive image modals, and a premium look & feel.

![Angular](https://img.shields.io/badge/Angular-21.1.0-DD0031?style=flat&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat&logo=tailwindcss)
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

1. Get your free TMDb API key at [themoviedb.org/settings/api](https://wwwoviedb.org/settings/api)

2. Open `src/environments/environment.ts` and replace `YOUR_API_KEY_HERE` with your actual key:
```typescript
export const environment = {
  production: false,
  tmdbApiKey: 'TU_API_KEY_AQUI',  // <-- Tu key aquí
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
};
```

> **Note**: Never commit your actual API key to git. Add `src/environments/environment.ts` to `.gitignore` if needed.



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

- **Movie Search**: Real-time search with debounce, search history persistence
- **Sorting**: Sort results by year, rating, or title (ascending/descending)
- **Top Rated Slider**: Horizontal slider showing top rated movies from current year (configurable)
- **Movie Details**: Full movie information with frosted glass hero design
- **Scenes Gallery**: Browse up to 20 backdrops with a pill showing additional images (+X)
- **Image Modal**: Interactive modal with keyboard navigation (←, →, Esc), smooth fade transitions, and body scroll lock
- **Favorites**: Save favorite movies with localStorage persistence
- **Dark Mode**: Toggle between light and dark themes with system preference detection
- **Theme Transitions**: Smooth polygon gradient animation when switching themes (View Transitions API)
- **SSR Support**: Server-side rendering for better SEO and performance
- **Responsive**: Fully responsive design for mobile, tablet, and desktop
- **Phosphor Icons**: Premium icon set for a polished UI

## 🛠 Tech Stack

- **Framework**: Angular 21 (Standalone Components, Signals, Effects)
- **Styling**: Tailwind CSS v4 + SCSS for animations
- **State**: Angular Signals + Services (no external libraries)
- **API**: TMDb (The Movie Database) v3
- **Icons**: Phosphor Icons
- **Build**: Angular CLI + Bun
- **Linting**: Biome
- **Testing**: Vitest
- **SSR**: Angular SSR with hydration

## 📚 External Libraries

| Library | Version | Description |
|---------|---------|-------------|
| [Phosphor Icons](https://phosphoricons.com/) | 2.1.2 | Premium icon family for polished UI |
| [Tailwind CSS](https://tailwindcss.com/) | 4.2.2 | Utility-first CSS framework |
| [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) | Native | Native browser API for smooth theme switch animations |
| [TMDb API](https://www.themoviedb.org/) | v3 | The Movie Database for movie data |

> **Note**: Most dependencies are Angular ecosystem packages. This project uses Angular Signals for state management—no external state management libraries (NgRx, RxJS, etc.) required.

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
│   │       └── services    # Business logic
│   │           ├── favorites.service.ts
│   │           └── movies-api.service.ts
│   ├── services/            # App-wide services
│   │   └── theme.service.ts
│   ├── app.config.ts        # App configuration
│   └── app.routes.ts        # Routing configuration
├── environments/            # Environment config
└── styles.scss              # Global styles + Tailwind
```

## 🎨 UI/UX Highlights

### Tailwind Integration
The project was migrated from SCSS-only to Tailwind CSS v4, featuring:
- Dark mode with `dark:` variants
- Backdrop blur effects for premium frosted glass look
- Gradient overlays and glassmorphism
- Custom animations and transitions

### Movie Detail Page
- Hero section with frosted glass background image
- Genre tags with color-coded badges
- Interactive Scenes gallery with image modal
- Rating cards with TMDb score visualization

### Search & Filtering
- Auto-search with debounce (300ms)
- Clear button inside search input
- Last search query persistence
- Multi-criteria sorting (year, rating, title)

### Image Modal
- Keyboard navigation (ArrowLeft, ArrowRight, Escape)
- Smooth fade-in/out transitions with subtle delay
- Body scroll lock when open
- Tooltips on all control buttons
- Image counter display (e.g., "3 / 20")

### Theme Toggle Animation
- Uses the native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- Polygon gradient effect that expands from top-left corner
- Smooth 1.5s animation with custom easing
- No flash between theme switches
- Fallback for browsers without View Transitions support

## 🔍 Key Files

- **`movies-api.service.ts`**: TMDb API integration with signals for reactive state
- **`favorites.service.ts`**: localStorage persistence with SSR compatibility guards
- **`theme.service.ts`**: Dark mode toggle with system preference detection
- **`movie-detail.page.ts`**: Main detail page with frosted glass hero, scenes gallery, and image modal
- **`search-bar.component.ts`**: Search input with clear button and debounce
- **`movies-list.page.ts`**: Home page with search persistence and sorting

## 📝 Development Notes

### SSR Compatibility
Services using `localStorage` or `document` must check for browser environment:
```typescript
// Check before accessing browser-only APIs
if (typeof document !== 'undefined') {
  document.body.style.overflow = 'hidden';
}
```

### Signals Usage
- Use `signal()` for writable state
- Use `.asReadonly()` for public read-only access
- Use `computed()` for derived state
- Use `effect()` for side effects (DOM manipulation, API calls)

### Animations
- CSS keyframes for component-level effects (fade, slide, zoom)
- Custom `imageFade` animation for modal transitions
- Tailwind `transition-*` classes for hover states
- Angular view transitions via `withViewTransitions()`

## 📄 License

MIT - Built for learning and demonstration purposes

---

Built with ❤️ using Angular + Tailwind CSS