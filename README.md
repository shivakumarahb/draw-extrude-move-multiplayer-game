# Babylon Colyseus Game

This repository contains multiplayer 3D game development. 

## Videos of Game Are given below (also available in result_videos folder)

## Table of Contents
- [Babylon Shape Extrusion with Colyseus](#task-3-babylon-shape-extrusion-with-colyseus)
- [Technologies Used](#technologies-used)

### Game overview and Draw function
[game_Overview](https://github.com/user-attachments/assets/bc2cb0ad-4894-4b0f-b07c-af35e1661151)

### game multiplayer functionality
[multiplayer game demo](https://github.com/user-attachments/assets/e5e3292d-fd21-4e99-8106-19fca17cfe7b)


## Babylon Shape Extrusion with Colyseus Game

This involves creating a multiplayer game where users can:
1. Draw 2D shapes.
2. Extrude the shapes into 3D space.
3. Move their 3D objects around a shared space visible to all players in real time.

### Features:
- **BabylonJS** for rendering 3D objects.
- **ColyseusJS** for real-time multiplayer synchronization.
- Users can see other players' shapes and movements on the same ground plane.
- users can join same room using room id
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

```

