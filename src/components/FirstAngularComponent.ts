import { Component, Input, inject } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-user-profile',
	template: `<div>User Name: {{ userName }}</div>`,
})
export class UserProfileComponent {
	@Input() userName: string = 'John Doe';
}

@Component({
	standalone: true,
	selector: 'app-user-container',
	template: `<app-user-profile [userName]="userNameSignal()" />`,
	imports: [UserProfileComponent],
})
export class UserComponent {
	userNameSignal = inject(() => 'Jane Doe');
}
