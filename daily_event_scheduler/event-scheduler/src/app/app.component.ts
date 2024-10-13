import { Component } from '@angular/core';
import { EventSchedulerComponent } from './event-scheduler/event-scheduler.component'; // Adjust the path if needed

@Component({
    selector: 'app-root',
    standalone: true,
    template: `<app-event-scheduler></app-event-scheduler>`,
    styles: [],
    imports: [EventSchedulerComponent] // Import the standalone component
})
export class AppComponent {
    title = 'Event Scheduler';
}
