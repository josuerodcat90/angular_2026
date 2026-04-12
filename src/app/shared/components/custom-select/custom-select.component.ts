import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	HostListener,
	ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectOption } from './custom-select.types';

/**
 * CustomSelectComponent — Custom dropdown select with Tailwind CSS
 *
 * Features:
 * - Angular Signals for reactive state
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close dropdown
 * - ARIA attributes for accessibility
 * - Dark mode support via Tailwind
 * - Smooth CSS transitions
 * - Search/filter functionality for options
 *
 * Design:
 * - OnPush change detection for performance
 * - Signal-based state management
 * - Standalone component (no NgModule required)
 */
@Component({
	selector: 'app-custom-select',
	standalone: true,
	imports: [CommonModule, FormsModule, TranslateModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="relative inline-block" [style.min-width]="minWidth" [style.width]="width">
			<!-- Label -->
			@if (label) {
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
					{{ label }}
				</label>
			}

			<!-- Trigger Button -->
			<button
				type="button"
				[attr.aria-expanded]="isOpen()"
				aria-haspopup="listbox"
				aria-controls="select-dropdown"
				[attr.aria-label]="label || placeholder"
				(click)="toggle()"
				[class]="getTriggerClasses()"
			>
				<span class="truncate pr-6">
					{{ translateLabels && selectedValue ? (getSelectedLabel() | translate) : (getSelectedLabel() || placeholder) }}
				</span>
				<i
					class="ph ph-caret-down text-lg absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-150"
					[class.rotate-180]="isOpen()"
					aria-hidden="true"
				></i>
			</button>

			<!-- Dropdown -->
			@if (isOpen()) {
				<div
					id="select-dropdown"
					role="listbox"
					[attr.aria-activedescendant]="focusedIndex() >= 0 ? 'option-' + focusedIndex() : null"
					[class]="getDropdownClasses()"
				>
					<!-- Search Input -->
					@if (enableSearch) {
						<div class="p-2 border-b border-gray-200 dark:border-gray-700">
							<input
								type="text"
								[(ngModel)]="searchText"
								(ngModelChange)="onSearchChange($event)"
								(click)="$event.stopPropagation()"
								[placeholder]="searchPlaceholder"
								class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
								aria-label="Search options"
							/>
						</div>
					}

					<!-- Options List -->
					<div class="overflow-y-auto" [style.max-height]="maxHeight">
						@for (option of filteredOptions; track option.value; let i = $index) {
							<button
								type="button"
								[id]="'option-' + i"
								role="option"
								[attr.aria-selected]="option.value === selectedValue"
								[class]="getOptionClasses(option.value === selectedValue, i === focusedIndex())"
								(click)="selectOption(option)"
								(mouseenter)="focusedIndex.set(i)"
							>
								<span class="truncate">
									{{ translateLabels ? (option.label | translate) : option.label }}
								</span>
								@if (option.value === selectedValue) {
									<i class="ph ph-check text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
								}
							</button>
						} @empty {
							<div class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
								No options found
							</div>
						}
					</div>
				</div>
			}
		</div>
	`,
})
export class CustomSelectComponent<T> {
	@Input() options: SelectOption<T>[] = [];
	@Input() selectedValue: T | null = null;
	@Input() placeholder = 'Select...';
	@Input() label = '';
	@Input() enableSearch = false;
	@Input() searchPlaceholder = 'Search...';
	@Input() maxHeight = '240px';
	@Input() translateLabels = false;
	@Input() minWidth = '';
	@Input() width = '';

	@Output() valueChange = new EventEmitter<T>();

	// Signals for reactive state
	isOpen = signal(false);
	focusedIndex = signal(-1);
	searchText = '';

	// Get filtered options based on search text
	get filteredOptions(): SelectOption<T>[] {
		if (!this.searchText) {
			return this.options;
		}
		const searchLower = this.searchText.toLowerCase();
		return this.options.filter((option) => option.label.toLowerCase().includes(searchLower));
	}

	// Handle search input change
	onSearchChange(text: string): void {
		this.searchText = text;
		// Reset focused index when searching
		this.focusedIndex.set(0);
	}

	// Helper to get selected label
	getSelectedLabel(): string {
		if (!this.selectedValue) {
			return '';
		}
		const option = this.options.find((o) => o.value === this.selectedValue);
		return option?.label || '';
	}

	// Get trigger classes based on state
	getTriggerClasses(): string {
		const base =
			'relative flex items-center w-full px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500';

		const state = this.isOpen()
			? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
			: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500';

		const colors = this.selectedValue
			? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
			: 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400';

		return `${base} ${state} ${colors}`;
	}

	// Get dropdown classes
	getDropdownClasses(): string {
		return 'absolute z-50 w-full mt-1 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transform transition-all duration-150 ease-out opacity-100 scale-100';
	}

	// Get option classes
	getOptionClasses(isSelected: boolean, isFocused: boolean): string {
		const base =
			'flex items-center justify-between w-full px-3 py-2 text-sm text-left cursor-pointer transition-colors duration-100';

		const hoverBg = 'hover:bg-gray-100 dark:hover:bg-gray-700';
		const selectedBg = isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : '';
		const focusedBg = isFocused ? 'bg-gray-100 dark:bg-gray-700' : '';

		const textColor = isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300';

		return `${base} ${hoverBg} ${selectedBg} ${focusedBg} ${textColor}`;
	}

	constructor(private elementRef: ElementRef) {}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.close();
		}
	}

	@HostListener('document:keydown', ['$event'])
	onKeydown(event: KeyboardEvent): void {
		if (!this.isOpen()) {
			return;
		}

		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				this.close();
				break;

			case 'ArrowDown':
				event.preventDefault();
				this.moveFocus(1);
				break;

			case 'ArrowUp':
				event.preventDefault();
				this.moveFocus(-1);
				break;

			case 'Enter':
				event.preventDefault();
				if (this.focusedIndex() >= 0) {
					this.selectOption(this.options[this.focusedIndex()]);
				}
				break;
		}
	}

	toggle(): void {
		this.isOpen.update((v) => !v);
		if (this.isOpen()) {
			this.searchText = '';
			this.focusedIndex.set(this.options.findIndex((o) => o.value === this.selectedValue));
		}
	}

	close(): void {
		this.isOpen.set(false);
		this.focusedIndex.set(-1);
		this.searchText = '';
	}

	selectOption(option: SelectOption<T>): void {
		this.selectedValue = option.value;
		this.valueChange.emit(option.value);
		this.close();
	}

	private moveFocus(delta: number): void {
		const filtered = this.filteredOptions;
		const newIndex = this.focusedIndex() + delta;
		if (newIndex >= 0 && newIndex < filtered.length) {
			this.focusedIndex.set(newIndex);
		} else if (newIndex < 0) {
			this.focusedIndex.set(filtered.length - 1);
		} else if (newIndex >= filtered.length) {
			this.focusedIndex.set(0);
		}
	}
}
