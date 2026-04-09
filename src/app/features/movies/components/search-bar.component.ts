import {
	ChangeDetectionStrategy,
	Component,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	signal,
	Input,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * SearchBarComponent — Reactive form for searching movies
 *
 * Features:
 * - Reactive form with title input only
 * - Debounced search (300ms) to reduce API calls
 * - Validates input (title required, ≥1 char)
 * - Clear button inside input, appears only when has text
 * - Accepts initial value to restore search state
 *
 * Events:
 * - search: emitted with { title: string }
 * - clearSearch: emitted on clear button click
 *
 * Design:
 * - OnPush change detection
 * - Reactive forms (FormBuilder, FormGroup)
 * - RxJS: debounceTime + distinctUntilChanged for efficiency
 */
@Component({
	selector: 'app-search-bar',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<form [formGroup]="searchForm" class="flex flex-wrap gap-4 p-6 bg-gray-200 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 transition-colors duration-300">
			<div class="flex flex-col gap-1 flex-1 min-w-[200px]">
				<label for="title-input" class="text-sm font-medium text-gray-700 dark:text-gray-300">Search movies:</label>
				<div class="relative">
					<i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"></i>
					<input
						id="title-input"
						type="text"
						formControlName="title"
						placeholder="e.g., Inception, Avatar..."
						class="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-base font-inherit bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						aria-label="Movie title search"
					/>
					@if (hasInput()) {
						<button
							type="button"
							(click)="onClear()"
							class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-[6px] cursor-pointer transition-colors"
							aria-label="Clear search"
							title="Clean search"
						>
							<i class="ph ph-x text-base"></i>
						</button>
					}
				</div>
				@if (titleControl.invalid && titleControl.touched) {
					<span class="text-red-500 text-xs mt-1">Enter a movie title (at least 1 character)</span>
				}
			</div>
		</form>
	`,
})
export class SearchBarComponent implements OnInit, OnDestroy {
	searchForm: FormGroup;

	/**
	 * Initial value to restore search state (e.g., when returning to home)
	 */
	@Input() initialValue = '';

	/**
	 * Track if input has value (for clear button visibility)
	 */
	hasInput = signal(false);

	/**
	 * Emitted when search submitted with debounce
	 */
	@Output() search = new EventEmitter<{ title: string }>();

	/**
	 * Emitted when clear button clicked
	 */
	@Output() clearSearch = new EventEmitter<void>();

	private destroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			title: ['', [Validators.required, Validators.minLength(1)]],
		});

		// Setup reactive search on value changes
		this.setupReactiveSearch();
	}

	ngOnInit() {
		// Restore initial value if provided
		if (this.initialValue) {
			this.searchForm.get('title')?.setValue(this.initialValue);
			this.hasInput.set(true);
		}
	}

	get titleControl() {
		return this.searchForm.get('title')!;
	}

	/**
	 * Setup debounced search on form value changes
	 */
	private setupReactiveSearch() {
		this.titleControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			// Update hasInput signal for clear button visibility
			this.hasInput.set(!!value && value.trim().length > 0);
		});

		this.titleControl.valueChanges
			.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe((title) => {
				if (title && title.trim()) {
					this.emitSearch();
				}
			});
	}

	/**
	 * Emit search event with form data
	 */
	private emitSearch() {
		const { title } = this.searchForm.value;
		if (title && title.trim()) {
			this.search.emit({
				title: title.trim(),
			});
		}
	}

	/**
	 * Clear search and form
	 */
	onClear() {
		this.searchForm.reset();
		this.hasInput.set(false);
		this.clearSearch.emit();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
