# AWS NodeJS & Angular Scheduler & Game

This repository contains the solution to the assignment involving three tasks that focus on cloud-based services using AWS (API Gateway, Lambda, S3), event scheduling, and multiplayer 3D game development. The tasks are completed using **NodeJS**, **Angular**, and **Go** (for Task 2, optionally). Below is an overview of each task, the thought process behind solving them, and instructions for setting up and running the project.

## Videos of working solution Are given below (also available in result_videos folder)

## Table of Contents
- videos of working solution
- [Task 1: APIs Lambda and S3](#task-1-apis-lambda-and-s3)
- [Task 2: Building a Daily Event Scheduler](#task-2-building-a-daily-event-scheduler)
- [Task 3: Babylon Shape Extrusion with Colyseus](#task-3-babylon-shape-extrusion-with-colyseus)
- [Technologies Used](#technologies-used)

---
### video of event Scheduler
[eventScheduler App](https://github.com/user-attachments/assets/e5d01824-4ba5-4a9e-a1a7-36d8df855b56)

### Game overview and Draw function
[game_Overview](https://github.com/user-attachments/assets/bc2cb0ad-4894-4b0f-b07c-af35e1661151)

### game multiplayer functionality
[multiplayer game demo](https://github.com/user-attachments/assets/e5e3292d-fd21-4e99-8106-19fca17cfe7b)



## Task 1: APIs Lambda and S3

In this task, I implemented two API endpoints using **AWS Lambda** and **AWS API Gateway** to store and retrieve JSON data using **Amazon S3** as the storage. Below are the details for each endpoint.

The APIs are live to check.

### Endpoints:

1. **POST Endpoint** (Store JSON Data):
   - **URL**: `https://ol4d31uz8i.execute-api.us-east-1.amazonaws.com/test/store`
   - **Method**: `POST`
   - **Headers**: 
     - `Content-Type: application/json`
   - **Request Payload Example**:
     ```bash
     curl -X POST https://ol4d31uz8i.execute-api.us-east-1.amazonaws.com/test/store \
           H "Content-Type: application/json"   \
        -d '{"name": "shivakumar", "age": 24}'
     ```
   - **Response**: 
     On successful storage, the service returns:
     ```bash 
     {"message":"File uploaded successfully","e_tag":"\"5cd69efc667a2285e106318882c07750\"","url":"https://shivajsonbucket.s3.amazonaws.com/data/1728819856727.json"}% 
     ```
     If the request contains invalid JSON (e.g., missing required fields), the response is:
     ```json
     {"error": "Invalid JSON in request body"}
     ```

2. **GET Endpoint** (Retrieve All Stored JSON Data):
   - **URL**: `https://ol4d31uz8i.execute-api.us-east-1.amazonaws.com/test/retrieve`
   - **Method**: `GET`
   - **Request Example**:
     ```bash
     curl -X GET https://ol4d31uz8i.execute-api.us-east-1.amazonaws.com/test/retrieve
     ```
   - **Response**: 
     The service compiles and returns all stored JSON files in S3 as an array of JSON objects. Example response:
     ```json
     [
       {"name": "John", "age": 30},
       {"name": "shiva", "age": 24},
       {"name": "shivakumar", "age": 24}
     ]
     ```

### Error Handling:
- The service handles invalid JSON inputs by returning a relevant error message.
- For any S3 access or AWS Lambda-related issues, additional error handling logic ensures that the API does not break.

### Thought Process:

- I chose AWS API Gateway and Lambda for their seamless integration and scalability.
- Using S3 for JSON file storage allows for easy management of data in a cloud environment, making it a flexible and cost-effective solution.
- Proper error handling is crucial, and I've added validation for the incoming JSON data.

## Task 2: Building a Daily Event Scheduler

This task involves creating a simple event scheduler that prevents overlapping events. It consists of a **Scheduler Class** in Angular with methods for adding events and retrieving all scheduled events.

### Components:
1. **Scheduler Class**:
   - `addEvent({ start_time, end_time }): Boolean`: Adds an event if there are no overlaps with existing events and returns `true`. If there is an overlap, it returns `false`.
   - `getEvents(): { start_time, end_time }[]`: Returns all scheduled events.
   
2. **User Interface**:
   - Users can input event start and end times via a simple UI.
   - The UI provides feedback on successful and failed event additions.
   - Displays scheduled events visually in a list.

### How to Run
``` bash
$ git clone git@github.com:shivakumarahb/aws-nodejs-angular-scheduler-game.git
```
```bash
Run go backend server :

$ cd daily_event_scheduler/backend-Go
$ go run main.go
```
``` bash
Run FrontEnd Angular App : 

$ cd Daily_Event_Scheduler/event-scheduler
$ npm install
$ ng serve

// click on the link to access scheduler app
```
```bash
apis for storing and retrieving events : 
 post :
    curl -X POST http://localhost:8010/events -d '{"start_time": 1, "end_time": 2}' -H "Content-Type: application/json"
get : 
    curl http://localhost:8010/events

```

### Thought Process:
I approached this problem by defining the logic to check for event overlaps in the `addEvent` method. I created an Angular-based UI to simplify input handling and validate that the times are within the 0-23 range. Once events were added successfully, I stored in backend  and used apis to get and display them.

---

## Task 3: Babylon Shape Extrusion with Colyseus Game

This task involves creating a multiplayer game where users can:
1. Draw 2D shapes.
2. Extrude the shapes into 3D space.
3. Move their 3D objects around a shared space visible to all players in real time.

### Features:
- **BabylonJS** for rendering 3D objects.
- **ColyseusJS** for real-time multiplayer synchronization.
- Users can see other players' shapes and movements on the same ground plane.
- Each users Object will get unique color 
- Using mouse click to move objects
- Added Draw Mode function

### How to Run

``` bash
$ git clone git@github.com:shivakumarahb/aws-nodejs-angular-scheduler-game.git
```
```bash
Run Colyseus server: 

$ cd babylon_shape_extrusion_with_colyseus-game/backend
$ npm install
$ npm start
```
```bash
Run FrontEnd Angular-Game App : 

$ cd babylon_shape_extrusion_with_colyseus-game
$ npm install
$ ng serve

// click on the link to access scheduler app

```



### Thought Process:
This task combined 3D rendering with real-time multiplayer mechanics. I started by setting up the BabylonJS scene to render 2D shapes and extrude them into 3D objects. ColyseusJS was used for managing the real-time multiplayer logic, allowing each player to move their 3D objects and see other players' movements simultaneously.

---
## Technologies Used:
- **AWS Lambda** & **API Gateway**
- **S3** for storage
- **NodeJS** for backend
- **Angular** for frontend
- **BabylonJS** & **ColyseusJS** for 3D multiplayer game
- **Go** (optional for Task 2)



