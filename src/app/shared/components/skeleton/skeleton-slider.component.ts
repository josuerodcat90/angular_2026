import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SkeletonSliderComponent — Loading placeholder for horizontal movie slider
 *
 * Used in MovieSliderComponent when data is loading
 * Displays animated placeholder matching slider dimensions
 *
 * Features:
 * - Pulsing animation for loading effect
 * - Matches MovieSliderComponent: 140×210px items
 * - Same horizontal layout as MovieSliderComponent
 * - Configurable item count
 *
 * Design:
 * - OnPush change detection
 * - Tailwind CSS for styling
 * - Dark mode support via dark: classes
 */
@Component({
	selector: 'app-skeleton-slider',
	standalone: true,
	imports: [CommonModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="relative w-full">
			<!-- Left Arrow Placeholder -->
			<button
				class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 animate-pulse z-10 flex items-center justify-center -translate-x-1/2"
				aria-hidden="true"
			>
				<div class="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
			</button>

			<!-- Slider Track -->
			<div class="flex gap-4 overflow-hidden py-2 px-6">
				@for (item of items(); track $index) {
					<div
						class="flex-shrink-0 w-[140px] animate-pulse px-2"
						role="status"
						aria-live="polite"
						[attr.aria-label]="'Loading item ' + ($index + 1)"
					>
						<!-- Poster placeholder -->
						<div
							class="w-[140px] h-[210px] rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
						></div>

						<!-- Title placeholder -->
						<div class="mt-3 space-y-2">
							<div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div class="flex justify-between">
								<div class="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="h-3 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						</div>
					</div>
				}
			</div>

			<!-- Right Arrow Placeholder -->
			<button
				class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 animate-pulse z-10 flex items-center justify-center translate-x-1/2"
				aria-hidden="true"
			>
				<div class="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
			</button>
		</div>
	`,
})
export class SkeletonSliderComponent {
	/**
	 * Number of skeleton items to display
	 * Default: 6 (matches typical slider display)
	 */
	@Input({ required: false }) itemCount = 6;

	/**
	 * Computed array for @for loop
	 */
	items(): number[] {
		return Array.from({ length: this.itemCount }, (_, i) => i);
	}
}
