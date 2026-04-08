import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './components/app-header.component';
import { ThemeService } from './services/theme.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, AppHeaderComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss',
})
export class App {
	protected readonly title = signal('CursoBigoteAngular');

	// Inject theme service to apply theme on app init
	// The service loads saved theme and applies it via effect
	constructor() {
		inject(ThemeService);
	}
}
