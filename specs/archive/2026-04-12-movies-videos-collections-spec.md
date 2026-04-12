# Videos and Collections Implementation Specification

## Overview

This document provides detailed specifications for implementing two new features in the MovieDetailPage: a Videos section displaying trailers and teasers with YouTube links, and a Collections section displaying related movies in a collection.

## 1. Videos Feature

### 1.1 Functional Requirements

#### Requirement: Video List Display

The system MUST display a list of videos (trailers and teasers) associated with a movie. Each video entry MUST show the video name, type (Trailer, Teaser, Clip, Behind the Scenes, or Featurette), and a clickable thumbnail that opens the video on YouTube.

#### Requirement: getMovieVideos API Method

The MoviesApiService MUST provide a getMovieVideos(movieId: string) method that fetches video data from the TMDb /movie/{id}/videos endpoint. The method MUST filter results to include only videos hosted on YouTube and return video type, name, key (YouTube ID), and official status.

#### Requirement: Video Signal Storage

The service MUST store videos in a signal (movieVideos: Signal<Video[]>) for reactive UI updates. The signal MUST be updated automatically when a new movie is loaded.

#### Requirement: Video Type Model

The Movie model or a new Video interface MUST include: id (string), key (string), name (string), site (string), type (string), and official (boolean).

### 1.2 User Scenarios

#### Scenario: User views trailer from movie detail

- GIVEN the user is on the MovieDetailPage for a movie that has trailers
- WHEN the Videos section is displayed
- THEN the user sees a list of available trailers and teasers
- AND each video shows a thumbnail with play icon
- AND clicking a video opens YouTube in a new tab

#### Scenario: No videos available

- GIVEN the user is on the MovieDetailPage for a movie with no videos
- WHEN the Videos section is displayed
- THEN the section is not rendered or shows "No videos available" message

#### Scenario: Filter YouTube-only videos

- GIVEN the API returns videos from multiple sources (YouTube, Vimeo)
- WHEN processing the video response
- THEN only videos where site equals "YouTube" are displayed
- AND videos from other sources are filtered out

### 1.3 Acceptance Criteria

- [ ] Videos section appears below the Scenes section in MovieDetailPage
- [ ] Each video displays thumbnail, title, and type badge
- [ ] Clicking a video opens YouTube URL in new tab
- [ ] Videos are sorted: Official Trailers first, then Trailers, then Teasers
- [ ] Section title uses translation key "DETAILS.VIDEOS"
- [ ] Empty state shows appropriate message or hides section

### 1.4 Non-Functional Requirements

#### Performance

- Video list API call MUST complete within 3 seconds
- Video thumbnails load with lazy loading to prevent blocking initial render
- Maximum 10 videos displayed per movie

#### Caching

- Video data SHOULD be cached for the duration of the user session
- Cached video data MUST persist when navigating back from detail to list

#### Internationalization (i18n)

- Video type labels MUST be translated (Trailer, Teaser, Clip, etc.)
- Empty state messages MUST use translation keys
- Section title MUST use translation key "DETAILS.VIDEOS"

### 1.5 Horizontal Scroll Layout

The Videos section MUST use horizontal scroll layout instead of a grid.

#### Requirement: Horizontal Scroll Container

- The videos MUST be displayed in a horizontal scrollable container
- The container MUST have overflow-x-auto and overflow-y-hidden
- The scroll area MUST use native scroll behavior with scrollLeft property
- scrollAmount for scrolling: 200px per arrow click

#### Requirement: Video Card Dimensions

- Each video card MUST have a fixed width of 192px (w-48)
- Card aspect ratio: 16:9 for thumbnail area
- Gap between cards: 16px (gap-4)

#### Requirement: Scroll Arrow Buttons

- Left and right arrow buttons MUST be provided for navigation
- Arrow buttons MUST have dimensions w-8 h-8
- Arrow buttons MUST have rounded-full class
- Arrow buttons MUST have bg-gray-300 background
- Arrow buttons MUST be positioned absolutely on left/right edges
- Arrows MUST use Phosphor Icons: ph-caret-left and ph-caret-right

#### Requirement: Arrow Visibility Logic

- Right arrow: Only visible when scrollWidth / 192 > 4 (more than 4 items visible)
- Left arrow: Only visible when scrollLeft > 0
- Visibility MUST be reactive to scroll position changes

---

## 2. Collections Feature

### 2.1 Functional Requirements

#### Requirement: Collection Display

The system MUST display collection information when a movie belongs to a collection. The display MUST show the collection name and a horizontal list of all movies in that collection.

#### Requirement: getCollectionDetails API Method

The MoviesApiService MUST provide a getCollectionDetails(collectionId: string) method that fetches collection data from the TMDb /collection/{id} endpoint. The method MUST return collection name and list of movies with their details.

#### Requirement: Current Movie Badge

When displaying movies in a collection, the system MUST identify which movie is currently being viewed and display a "Current" badge on that movie card. The current movie card MUST NOT be clickable.

#### Requirement: Collection Signal Storage

The service MUST store collection data in a signal (movieCollection: Signal<Collection | null>) for reactive UI updates. The signal MUST be null when the movie does not belong to a collection.

#### Requirement: Collection Type Model

The Movie model or new Collection interface MUST include: id (number), name (string), and movies (CollectionMovie[]). The CollectionMovie interface MUST include: id, title, poster_path, backdrop_path, and release_date.

### 2.2 User Scenarios

#### Scenario: User views collection from movie detail

- GIVEN the user is on the MovieDetailPage for a movie that belongs to a collection
- WHEN the Collections section is displayed
- THEN the user sees the collection name as section header
- AND sees horizontal scrollable list of all movies in collection
- AND current movie shows "Current" badge
- AND current movie card is not clickable

#### Scenario: Movie not in collection

- GIVEN the user is on the MovieDetailPage for a movie that does not belong to a collection
- WHEN the page loads
- THEN the Collections section is not rendered

#### Scenario: Navigate to another movie in collection

- GIVEN the user sees a collection with multiple movies
- WHEN clicking on a movie card (not the current movie)
- THEN the app navigates to that movie's detail page

### 2.3 Acceptance Criteria

- [ ] Collections section appears below Videos section
- [ ] Collection name displayed as section header
- [ ] Movie cards show poster and title
- [ ] Current movie shows "Current" badge
- [ ] Current movie card is not clickable (no link/button)
- [ ] Other movies are clickable and navigate to their detail page
- [ ] Empty or standalone movie hides the section
- [ ] Section title uses translation key "DETAILS.COLLECTION"

### 2.4 Non-Functional Requirements

#### Performance

- Collection API call MUST complete within 3 seconds
- Poster images use lazy loading
- Maximum 20 movies displayed per collection

#### Caching

- Collection data SHOULD be cached for the session duration

#### Internationalization (i18n)

- Section title MUST use translation key "DETAILS.COLLECTION"
- "Current" badge text MUST use translation key "DETAILS.CURRENT"
- Empty messages MUST use translation keys

### 2.5 Horizontal Scroll Layout with Arrows

The Collections section MUST use horizontal scroll with left/right arrow buttons.

#### Requirement: Scroll Arrow Buttons

- Left and right arrow buttons MUST be provided for navigation
- Arrow buttons MUST have dimensions w-8 h-8
- Arrow buttons MUST have rounded-full class
- Arrow buttons MUST have bg-gray-300 background
- Arrow buttons MUST be positioned absolutely on left/right edges
- Arrows MUST use Phosphor Icons: ph-caret-left and ph-caret-right
- scrollAmount for scrolling: 300px per arrow click

#### Requirement: Arrow Visibility Logic

- Right arrow: Only visible when scrollWidth / 140 > 5 (more than 5 items visible)
- Left arrow: Only visible when scrollLeft > 0
- Visibility MUST be reactive to scroll position changes

#### Requirement: Initial Scroll Position

- If current movie index >= 5: scroll to the right (scrollLeft = scrollWidth)
- If current movie index < 5: scroll to beginning (scrollLeft = 0)
- Only applies if collection has more than 5 movies

#### Requirement: Chronological Sorting

- Movies MUST be sorted by releaseDate ascending (earliest first)
- Release date format: Year only displayed

#### Requirement: Card Dimensions

- Card width: 140px (w-28), 160px on desktop (md:w-32)
- Fixed card height: 220px (h-[220px])
- Gap between cards: 12px (gap-3)

#### Requirement: Hover Effects

- hover:scale-105 MUST be applied to the anchor tag (not just the image)
- group-hover:shadow-xl MUST be applied to the anchor tag

#### Requirement: Title Text Wrapping

- Title text MUST use break-words class
- Title max-width: 128px (max-w-[128px])

#### Requirement: Current Badge Styling

- Badge position: top-left corner of card (absolute positioned)
- Badge shape: pill-shaped (px-2 py-0.5 rounded-full)

#### Requirement: Year Display

- Year MUST be displayed below title
- Calendar icon (ph-calendar-blank) MUST be shown next to year

---

## 3. API Integration Details

### 3.1 TMDb Endpoints

```
GET /movie/{movie_id}/videos
Parameters: api_key, language
Response: { id, results: [{ id, key, name, site, type, official }] }

GET /collection/{collection_id}
Parameters: api_key, language
Response: { id, name, parts: [{ id, title, poster_path, backdrop_path, release_date }] }
```

### 3.2 Model Extensions

```typescript
// Video interface for videos feature
export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

// Collection interface for collections feature
export interface Collection {
  id: number;
  name: string;
  posterPath?: string;
  backdropPath?: string;
  movies: CollectionMovie[];
}

export interface CollectionMovie {
  id: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
}
```

### 3.3 Service Methods to Add

```typescript
// In MoviesApiService
getMovieVideos(id: string): Observable<Video[]>

getCollectionDetails(collectionId: string): Observable<Collection | null>
```

### 3.4 Service Signals to Add

```typescript
// In MoviesApiService
movieVideos = signal<Video[]>([])

movieCollection = signal<Collection | null>(null)
```

---

## 4. UI Implementation Guidelines

### 4.1 Videos Section Layout

- Section icon: Film strip icon (ph-film-strip)
- Section title: "Videos" (translated)
- **Horizontal scroll layout with arrow buttons**
- Each video card:
  - Fixed width: 192px (w-48)
  - YouTube thumbnail (img.youtube.com/vi/{key}/mqdefault.jpg)
  - Play button overlay
  - Video name (truncated if too long)
  - Type badge (Trailer/Teaser/Clip)
- Arrow buttons: w-8 h-8, rounded-full, bg-gray-300
- Right arrow visibility: scrollWidth / 192 > 4
- Left arrow visibility: scrollLeft > 0

### 4.2 Collections Section Layout

- Section icon: Collection stack icon (ph-squares-four)
- Section title: Collection name
- **Horizontal scroll layout with arrow buttons**
- Each movie card:
  - Width: 140px (w-28), 160px desktop (md:w-32)
  - Height: 220px (h-[220px])
  - Poster image (w185 size)
  - Title below with break-words and max-w-[128px]
  - Year with calendar icon (ph-calendar-blank)
  - "Current" badge for current movie (pill-shaped: px-2 py-0.5 rounded-full)
  - Non-current movies wrapped in clickable link with hover effects
- Arrow buttons: w-8 h-8, rounded-full, bg-gray-300
- Right arrow visibility: scrollWidth / 140 > 5
- Left arrow visibility: scrollLeft > 0
- Initial scroll position based on current movie index

---

## 5. Translation Keys Required

| Key | English | Spanish |
|-----|---------|----------|
| DETAILS.VIDEOS | Videos | Vídeos |
| DETAILS.COLLECTION | Part of Collection | Parte de la Colección |
| DETAILS.CURRENT | Current | Actual |
| DETAILS.NO_VIDEOS | No videos available | No hay vídeos disponibles |
| DETAILS.NO_COLLECTION | This movie is not part of a collection | Esta película no es parte de una colección |

---

## 6. Error Handling

### 6.1 Video API Errors

- On API failure: Set movieVideos to empty array, log error, do not show error banner
- On YouTube link failure: Open YouTube search as fallback

### 6.2 Collection API Errors

- On API failure: Set movieCollection to null, do not render section
- On collection movie image load failure: Use placeholder image

---

## 7. Testing Requirements

### 7.1 Unit Tests

- getMovieVideos filters YouTube videos correctly
- getCollectionDetails maps TMDb response to Collection type
- Current movie identification works correctly

### 7.2 Component Tests

- Videos section renders when videos exist
- Videos section hidden when no videos
- Collections section renders for collection movies
- Current movie badge displays correctly
- Current movie not clickable

### 7.3 Integration Tests

- Full flow: Load movie with videos and collection -> display both sections correctly
- Navigation: Click collection movie -> navigate to that movie's detail

---

## 8. Dependencies

- No new npm dependencies required
- Uses existing Phosphor Icons
- Uses existing translation infrastructure
- Uses existing API service patterns

---

## 9. Bugfixes

### 9.1 SSR/Hydration Ordering Fix

#### Problem

During SSR or page reload (Ctrl+Shift+R), the collection section was rendering BEFORE the hero section, causing visual duplication. This happened because collection signals were evaluated before the movie signal had data.

#### Solution

Added `movie() &&` condition to all sections that depend on external data to ensure proper rendering order.

#### Sections Affected

- **Backdrops/Scenes**: Changed from `@if (backdrops().length > 0)` to `@if (movie() && backdrops().length > 0)`
- **Videos**: Changed from `@if (movieVideos().length > 0)` to `@if (movie() && movieVideos().length > 0)`
- **Collection**: Changed from `@if (collectionMovies().length > 0)` to `@if (movie() && collectionMovies().length > 0)`

#### Correct Render Order (Top to Bottom)

1. Hero (poster + info)
2. Genres
3. Backdrops/Scenes
4. Videos
5. Collection
6. Ratings
7. Crew
8. Additional Info

#### Acceptance Criteria

- [ ] No visual duplication during SSR or page reload
- [ ] Collection section renders after hero section
- [ ] All dependent sections use proper guard condition (`movie() &&`)
- [ ] Page functions correctly on Ctrl+Shift+R hard refresh