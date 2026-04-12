import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SkeletonCardComponent — Loading placeholder for movie cards
 *
 * Used in MovieGridComponent when data is loading
 * Displays animated placeholder matching the movie card dimensions
 *
 * Features:
 * - Pulsing animation for loading effect
 * - Matches movie card: 300px poster height
 * - Responsive width (fills grid cell)
 *
 * Design:
 * - OnPush change detection
 * - Tailwind CSS for styling
 * - Dark mode support via dark: classes
 */
@Component({
	selector: 'app-skeleton-card',
	standalone: true,
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div
			role="status"
			aria-live="polite"
			aria-label="Loading movie card"
			class="w-full animate-pulse"
		>
			<!-- Poster placeholder -->
			<div
				class="w-full h-[300px] rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
			></div>

			<!-- Title placeholder -->
			<div class="mt-3 space-y-2">
				<div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>

				<!-- Year + Rating row -->
				<div class="flex justify-between">
					<div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div class="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
				</div>
			</div>
		</div>
	`,
})
export class SkeletonCardComponent {}
