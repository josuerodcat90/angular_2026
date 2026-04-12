import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SkeletonDetailComponent — Loading placeholder for movie detail page
 *
 * Used in MovieDetailPage when data is loading
 * Displays animated placeholders matching all detail page sections
 *
 * Sections matched:
 * - Hero: poster + info + plot + favorite button
 * - Genres: genre badges
 * - Ratings: TMDb rating + vote count
 * - Crew: director, writer, actors cards
 * - Additional Info: release date, IMDB
 *
 * Features:
 * - Pulsing animation for loading effect
 * - Matches MovieDetailPage layout dimensions
 * - Accessible with role="status" and aria-live
 *
 * Design:
 * - OnPush change detection
 * - Tailwind CSS for styling
 * - Dark mode support via dark: classes
 */
@Component({
	selector: 'app-skeleton-detail',
	standalone: true,
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div role="status" aria-live="polite" aria-label="Loading movie details" class="w-full animate-pulse">
			<!-- Header placeholder -->
			<div class="flex items-center gap-4 mb-6">
				<div class="w-20 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				<div class="flex-1 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				<div class="w-20 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
			</div>

			<!-- Hero section -->
			<div class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6">
				<div class="flex flex-col md:flex-row gap-6 h-[400px]">
					<!-- Poster placeholder -->
					<div class="flex-shrink-0">
						<div class="h-full w-[280px] rounded-lg bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500"></div>
					</div>

					<!-- Info placeholder -->
					<div class="flex-1 flex flex-col justify-between gap-4">
						<div class="space-y-3">
							<!-- Title -->
							<div class="h-10 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>

							<!-- Quick info badges -->
							<div class="flex flex-wrap gap-2">
								<div class="h-7 w-20 rounded-full bg-gray-300 dark:bg-gray-600"></div>
								<div class="h-7 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
								<div class="h-7 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
								<div class="h-7 w-16 rounded-full bg-gray-300 dark:bg-gray-600"></div>
							</div>
						</div>

						<!-- Plot + Favorite placeholder -->
						<div class="flex flex-col gap-4 flex-1">
							<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-l-4 border-gray-300 dark:border-gray-600">
								<div class="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600 mb-3"></div>
								<div class="space-y-2">
									<div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
									<div class="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
									<div class="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
								</div>
							</div>

							<!-- Favorite button -->
							<div class="h-12 w-full rounded-lg bg-gray-300 dark:bg-gray-600"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Genres placeholder -->
			<div class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6">
				<div class="flex items-center gap-2 mb-4">
					<div class="h-8 w-8 rounded bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-24 rounded bg-gray-300 dark:bg-gray-600"></div>
				</div>
				<div class="flex flex-wrap gap-2">
					<div class="h-8 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-20 rounded-full bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-28 rounded-full bg-gray-300 dark:bg-gray-600"></div>
				</div>
			</div>

			<!-- Ratings placeholder -->
			<div class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6">
				<div class="flex items-center gap-2 mb-4">
					<div class="h-8 w-8 rounded bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-20 rounded bg-gray-300 dark:bg-gray-600"></div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col items-center px-6 py-4 rounded-lg bg-gray-300 dark:bg-gray-600">
						<div class="h-9 w-16 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-4 w-12 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
					<div class="flex flex-col items-center px-6 py-4 rounded-lg bg-gray-300 dark:bg-gray-600">
						<div class="h-9 w-16 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-4 w-12 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
				</div>
			</div>

			<!-- Crew placeholder -->
			<div class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6">
				<div class="flex items-center gap-2 mb-4">
					<div class="h-8 w-8 rounded bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
				</div>
				<div class="grid gap-4">
					<div class="flex flex-col p-4 rounded-lg bg-gray-300 dark:bg-gray-600 border-l-4 border-gray-400 dark:border-gray-500">
						<div class="h-4 w-20 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-5 w-40 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
					<div class="flex flex-col p-4 rounded-lg bg-gray-300 dark:bg-gray-600 border-l-4 border-gray-400 dark:border-gray-500">
						<div class="h-4 w-20 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-5 w-48 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
					<div class="flex flex-col p-4 rounded-lg bg-gray-300 dark:bg-gray-600 border-l-4 border-gray-400 dark:border-gray-500">
						<div class="h-4 w-16 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-5 w-56 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
				</div>
			</div>

			<!-- Additional Info placeholder -->
			<div class="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 mb-6">
				<div class="flex items-center gap-2 mb-4">
					<div class="h-8 w-8 rounded bg-gray-300 dark:bg-gray-600"></div>
					<div class="h-8 w-36 rounded bg-gray-300 dark:bg-gray-600"></div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex flex-col p-4 rounded-lg bg-gray-300 dark:bg-gray-600 border-l-4 border-gray-400 dark:border-gray-500">
						<div class="h-4 w-24 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-5 w-28 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
					<div class="flex flex-col p-4 rounded-lg bg-gray-300 dark:bg-gray-600 border-l-4 border-gray-400 dark:border-gray-500">
						<div class="h-4 w-12 rounded bg-gray-400 dark:bg-gray-500 mb-2"></div>
						<div class="h-5 w-20 rounded bg-gray-400 dark:bg-gray-500"></div>
					</div>
				</div>
			</div>
		</div>
	`,
})
export class SkeletonDetailComponent {}
