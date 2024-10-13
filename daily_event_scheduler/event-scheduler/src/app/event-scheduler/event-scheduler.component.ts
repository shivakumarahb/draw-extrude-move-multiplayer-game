import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';    


interface Event {
    start_time: number;
    end_time: number;
}

@Component({
    selector: 'app-event-scheduler',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './event-scheduler.component.html',
    styleUrls: ['./event-scheduler.component.css']
})
export class EventSchedulerComponent {
    events: Event[] = [];
    startTime: number = 0;
    endTime: number = 0;
    errorMessage: string = '';
    apiUrl: string = 'http://localhost:8010/events'; 

    constructor(private http: HttpClient) {
        this.getEvents(); 
    }

    addEvent() {
        if (this.startTime < 0 || this.endTime > 23 || this.startTime >= this.endTime) {
            this.errorMessage = 'Invalid time range.';
            return;
        }

        const newEvent: Event = { start_time: this.startTime, end_time: this.endTime };

        this.http.post(this.apiUrl, newEvent, { responseType: 'text' }).subscribe({
            next: () => {
                this.errorMessage = '';
                this.getEvents(); 
            },
            error: (error) => {
                console.error(error);
                this.errorMessage = error.error;
                console.log(error.error)
            }
        });
    }

    getEvents() {
        this.http.get<Event[]>(this.apiUrl).subscribe({
            next: (events) => {
                this.events = events;
            },
            error: (error) => {
                console.error(error);
                this.errorMessage = error.error;
            }
        });
    }
}
