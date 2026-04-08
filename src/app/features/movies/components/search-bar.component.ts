import { ChangeDetectionStrategy, Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * SearchBarComponent — Reactive form for searching movies
 *
 * Features:
 * - Reactive form with title and year inputs
 * - Debounced search (300ms) to reduce API calls
 * - Validates input (title required, ≥1 char)
 * - Form submission support
 *
 * Events:
 * - search: emitted with { title: string, year?: number }
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
		<form [formGroup]="searchForm" (ngSubmit)="onSubmit()" class="search-bar">
			<div class="search-bar__group">
				<label for="title-input" class="search-bar__label">Search movies:</label>
				<input
					id="title-input"
					type="text"
					formControlName="title"
					placeholder="e.g., Inception, Avatar..."
					class="search-bar__input"
					aria-label="Movie title search"
				/>
				@if (titleControl.invalid && titleControl.touched) {
					<span class="search-bar__error">Enter a movie title (at least 1 character)</span>
				}
			</div>

			<div class="search-bar__group">
				<label for="year-input" class="search-bar__label">Year (optional):</label>
				<input
					id="year-input"
					type="number"
					formControlName="year"
					placeholder="e.g., 2010"
					class="search-bar__input"
					min="1900"
					[max]="currentYear"
					aria-label="Movie year filter"
				/>
			</div>

			<div class="search-bar__actions">
				<button
					type="submit"
					class="search-bar__btn search-bar__btn--primary"
					[disabled]="searchForm.invalid"
				>
					Search
				</button>
				<button
					type="button"
					(click)="onClear()"
					class="search-bar__btn search-bar__btn--secondary"
				>
					Clear
				</button>
			</div>
		</form>
	`,
	styles: [
		`
			.search-bar {
				display: flex;
				flex-wrap: wrap;
				gap: 1rem;
				padding: 1.5rem;
				background: var(--color-bg-secondary);
				border-radius: 8px;
				border: 1px solid var(--color-border);
				transition: background-color 0.3s ease;
			}

			.search-bar__group {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				flex: 1;
				min-width: 200px;
			}

			.search-bar__label {
				font-size: 0.875rem;
				font-weight: 500;
				color: var(--color-text-primary);
			}

			.search-bar__input {
				padding: 0.75rem;
				border: 1px solid var(--color-border);
				border-radius: 4px;
				font-size: 1rem;
				font-family: inherit;
				background: var(--color-bg-primary);
				color: var(--color-text-primary);
				transition: border-color 0.2s, box-shadow 0.2s;
			}

			.search-bar__input:focus {
				outline: none;
				border-color: var(--color-accent);
				box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
			}

			.search-bar__error {
				color: var(--color-error);
				font-size: 0.75rem;
				margin-top: 0.25rem;
			}

			.search-bar__actions {
				display: flex;
				gap: 0.75rem;
				align-items: flex-end;
				flex-wrap: wrap;
			}

			.search-bar__btn {
				padding: 0.75rem 1.5rem;
				border: none;
				border-radius: 4px;
				font-size: 1rem;
				font-weight: 500;
				cursor: pointer;
				transition: background-color 0.2s, color 0.2s;
			}

			.search-bar__btn--primary {
				background: var(--color-accent);
				color: white;
			}

			.search-bar__btn--primary:hover:not(:disabled) {
				background: var(--color-accent-hover);
			}

			.search-bar__btn--primary:disabled {
				background: var(--color-text-tertiary);
				cursor: not-allowed;
				opacity: 0.6;
			}

			.search-bar__btn--secondary {
				background: var(--color-bg-primary);
				color: var(--color-accent);
				border: 1px solid var(--color-accent);
			}

			.search-bar__btn--secondary:hover {
				background: var(--color-bg-tertiary);
			}

			@media (max-width: 768px) {
				.search-bar {
					flex-direction: column;
				}

				.search-bar__group {
					min-width: auto;
				}

				.search-bar__actions {
					justify-content: space-between;
				}

				.search-bar__btn {
					flex: 1;
				}
			}
		`,
	],
})
export class SearchBarComponent implements OnDestroy {
	searchForm: FormGroup;
	currentYear = new Date().getFullYear();

	/**
	 * Emitted when search submitted with debounce
	 */
	@Output() search = new EventEmitter<{ title: string; year?: number }>();

	/**
	 * Emitted when clear button clicked
	 */
	@Output() clearSearch = new EventEmitter<void>();

	private destroy$ = new Subject<void>();

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			title: ['', [Validators.required, Validators.minLength(1)]],
			year: [null],
		});

		// Setup reactive search on value changes
		this.setupReactiveSearch();
	}

	get titleControl() {
		return this.searchForm.get('title')!;
	}

	/**
	 * Setup debounced search on form value changes
	 */
	private setupReactiveSearch() {
		this.titleControl.valueChanges
			.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
			.subscribe((title) => {
				if (title && title.trim()) {
					this.emitSearch();
				}
			});
	}

	/**
	 * Manual search submission
	 */
	onSubmit() {
		if (this.searchForm.valid) {
			this.emitSearch();
		}
	}

	/**
	 * Emit search event with form data
	 */
	private emitSearch() {
		const { title, year } = this.searchForm.value;
		if (title && title.trim()) {
			this.search.emit({
				title: title.trim(),
				year: year ? Number(year) : undefined,
			});
		}
	}

	/**
	 * Clear search and form
	 */
	onClear() {
		this.searchForm.reset();
		this.clearSearch.emit();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
