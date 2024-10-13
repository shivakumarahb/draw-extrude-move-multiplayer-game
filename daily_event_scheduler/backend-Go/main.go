package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
)

type Event struct {
	StartTime int `json:"start_time"`
	EndTime   int `json:"end_time"`
}

type Scheduler struct {
	events []Event
}

func (s *Scheduler) AddEvent(newEvent Event) bool {
	fmt.Printf("Event came :\n %v", newEvent)

	for _, event := range s.events {
		if !(newEvent.EndTime <= event.StartTime || newEvent.StartTime >= event.EndTime) {
			fmt.Printf("Event overlap \n: %v", newEvent)
			return false
		}
	}
	s.events = append(s.events, newEvent)
	fmt.Printf("Event added: %v", newEvent)
	sort.Slice(s.events, func(i, j int) bool {
		return s.events[i].StartTime < s.events[j].StartTime
	})
	return true
}

func (s *Scheduler) GetEvents() []Event {
	fmt.Printf("Event requested:\n")
	return s.events
}

var scheduler = Scheduler{}

func addEventHandler(w http.ResponseWriter, r *http.Request) {
	var newEvent Event
	err := json.NewDecoder(r.Body).Decode(&newEvent)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if success := scheduler.AddEvent(newEvent); !success {
		http.Error(w, "Event overlaps with an existing event", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "Event added successfully")
}

func getEventsHandler(w http.ResponseWriter, r *http.Request) {
	events := scheduler.GetEvents()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func corsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodPost {
		addEventHandler(w, r)
	} else if r.Method == http.MethodGet {
		getEventsHandler(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/events", corsHandler)

	log.Println("Server is running on http://localhost:8010")
	err := http.ListenAndServe(":8010", nil)
	if err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
