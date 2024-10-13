import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, Color3, StandardMaterial, Mesh, PolygonMeshBuilder } from 'babylonjs';
import earcut from 'earcut';
import { GameService } from '../game.service';
import { GameState } from 'backend/src/rooms/schema/GameState';
import { Player } from 'backend/src/rooms/schema/GameState';
import { Room } from 'colyseus.js';
import { MapSchema } from "@colyseus/schema";
import { DataChange } from '@colyseus/schema';

interface Point {
  x: number;
  z: number;
}

@Component({
  selector: 'app-babylon-scene',
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.css']
})
export class GameScreenComponent implements OnInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  private engine!: Engine;
  private scene!: Scene;
  private camera!: ArcRotateCamera;
  public cameraControlAttached: boolean = false;

  private startPoint: Vector3 | null = null;
  public drawMode: boolean = false;
  private drawnPoints: Vector3[] = [];

  private playerEntities: { [playerId: string]: Mesh } = {};
  private playerNextPosition: { [playerId: string]: Vector3 } = {};

  private originalCameraPosition: Vector3 = new Vector3(0, 0, 0);
  private originalCameraTarget: Vector3 = new Vector3(0, 0, 0);

  private geometries: Mesh[] = []; // Stores created geometries
  public selectedGeometry: Mesh | null = null;
  private playerShapes: { [sid: string]: Mesh } = {};
  private game: GameService;

  public roomId = localStorage.getItem('roomId');

  public got_player_shape: boolean = false;


  constructor(private gameService: GameService) {
    this.game = gameService;
  }

  ngOnInit() {
    this.initScene();
    this.initPlayers();
    window.addEventListener('resize', () => this.onResize());
  }


  ngOnDestroy() {
    this.engine.dispose();
  }


initPlayers(): void {
    const sid = this.game._room?.sessionId;

    this.game._room?.onMessage("Rdrawpoints", (data) => {
        if (data.sessionId !== sid) {
            // Check if a shape has already been created for this player
            if (!this.playerShapes[data.sessionId]) {
                const shape = data.points.map((p: { x: number; z: number }) => new Vector3(p.x, 0, p.z));
                const extrudedMesh = MeshBuilder.ExtrudePolygon(
                    `geometry${Date.now()}`,
                    {
                        shape,
                        depth: 10,
                        sideOrientation: Mesh.DOUBLESIDE,
                        updatable: true,
                        wrap: true,
                    },
                    this.scene,
                    earcut
                );

                extrudedMesh.position.y = 1;  // Adjust position slightly above the ground
                extrudedMesh.convertToFlatShadedMesh();  // Solid appearance

                const material = new StandardMaterial('geometryMaterial', this.scene);
                const playerColor = this.generateUniqueColor(data.sessionId);
                material.diffuseColor = playerColor;
                extrudedMesh.material = material;
                extrudedMesh.visibility = 1;

                // Store the created mesh in the playerShapes object
                this.playerShapes[data.sessionId] = extrudedMesh;

                console.log("Extruded Mesh Created for SID:", data.sessionId, extrudedMesh);
            } else {
                console.log("Shape already created for SID:", data.sessionId);
            }

            console.log(data.points);
        } else {
            console.log("same client");
        }
    });

    this.game._room?.onMessage("playerMoved", (data) => {
        if (data.sessionId !== sid) {
            if (this.playerShapes[data.sessionId]) {
                this.animateMovement(this.playerShapes[data.sessionId], data.position.x - 50, data.position.z + 50, data.position.y, 1000); // 1000 ms for the animation duration
            }
            console.log("Player moved for SID:", data.sessionId);
        } else {
            console.log("same client");
        }
    });
}


generateUniqueColor(sessionId: string): Color3 {
  let hash = 0;
  
  for (let i = 0; i < sessionId.length; i++) {
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const r = ((hash >> 24) & 0xFF) / 255;
  const g = ((hash >> 16) & 0xFF) / 255;
  const b = ((hash >> 8) & 0xFF) / 255;

  return new Color3(r, g, b);
}



  private initScene() {
    this.engine = new Engine(this.canvas.nativeElement, true);
    this.scene = new Scene(this.engine);

    this.camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3.5, 200, new Vector3(0, 0, 0), this.scene);
    this.camera.minZ = 0.1; // Set minimum Z
    this.camera.maxZ = 1000; // Set maximum Z
    this.camera.lowerBetaLimit = 0; // Prevent going below the ground
    this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
    this.originalCameraPosition = this.camera.position.clone();
    this.originalCameraTarget = this.camera.target.clone();
    //this.camera.attachControl(this.canvas.nativeElement, true);

    const light1 = new HemisphericLight('light', new Vector3(1, 1, 0), this.scene);
    const light2 = new HemisphericLight('light', new Vector3(0, 1, 1), this.scene);
    light1.intensity = 0.5;
    light2.intensity = 0.5;

    const ground = MeshBuilder.CreateGround('ground', { width: 200, height: 200, subdivisions: 2 }, this.scene);
    ground.position.y = -10;
    const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseColor = new Color3(0.5, 0.3, 0.3);
    ground.material = groundMaterial;

    this.canvas.nativeElement.addEventListener('click', (event) => this.onCanvasClick(event));

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }





  private onCanvasClick(event: MouseEvent) {
    const pickResult = this.scene.pick(event.clientX, event.clientY);
    if (pickResult?.hit) {
      const clickedPoint = pickResult.pickedPoint!;

      if (this.drawMode) {
        if (!this.startPoint) {
          this.startPoint = clickedPoint;
          this.drawnPoints.push(clickedPoint);
        } else {
          this.addLine(this.startPoint, clickedPoint);
          this.startPoint = clickedPoint;
          this.drawnPoints.push(clickedPoint);
        }
      } else {
        // If not in draw mode, move the selected geometry smoothly
        if (this.selectedGeometry) {
          // Adjust the Y position based on the ground height
          const targetY = 2; // Desired height above the ground
          const adjustedPosition = new Vector3(clickedPoint.x, targetY, clickedPoint.z);
          const positionData = {
            x: clickedPoint.x, // Replace with actual position logic
            y: targetY,
            z: clickedPoint.z,
          };

          // Send the updatePosition message to the server

          this.game._room!.send("updatePosition", positionData);
          const pointsToSend = this.drawnPoints.map(point => ({ x: point.x, z: point.z }));
          this.game._room!.send("SendDrawpoints", pointsToSend);

          //  console.log(this.game._room!.sessionId)
          console.log("Position updated:", positionData);
          console.log("draw points:", this.drawnPoints);

          // Animate the movement to the adjusted position
          this.animateMovement(this.selectedGeometry, adjustedPosition.x - 50, adjustedPosition.z + 50, adjustedPosition.y, 1000); // 1000 ms for the animation duration
        }
      }
    }
  }


  private animateMovement(shape: Mesh, targetX: number, targetZ: number, targetY: number, duration: number) {
    const startX = shape.position.x;
    const startZ = shape.position.z;
    const startY = shape.position.y;

    const distanceX = targetX - startX;
    const distanceZ = targetZ - startZ;
    const distanceY = targetY - startY;

    const steps = 50; // Number of steps for the animation
    const stepDuration = duration / steps; // Time per step

    let currentStep = 0;

    const animate = () => {
      if (currentStep < steps) {
        const progress = currentStep / steps;

        // Interpolate positions
        shape.position.x = startX + distanceX * progress;
        shape.position.z = startZ + distanceZ * progress;
        shape.position.y = targetY; // Maintain the desired height
        // console.log(shape.position.x, shape.position.y, shape.position.z)

        currentStep++;
        requestAnimationFrame(animate); // Request the next animation frame
      } else {
        // Ensure the final position is set
        shape.position.x = targetX;
        shape.position.z = targetZ;
        shape.position.y = targetY;
      }
    };

    animate(); // Start the animation
  }



  private addLine(start: Vector3, end: Vector3) {
    const line = MeshBuilder.CreateLines('line', { points: [start, end] }, this.scene);
    this.geometries.push(line);
  }

  toggleCameraControl() {
    if (this.cameraControlAttached) {
      this.camera.detachControl();
    } else {
      this.camera.attachControl(this.canvas.nativeElement, true);
    }
    this.cameraControlAttached = !this.cameraControlAttached;
  }

  drawModeStart() {
    this.drawMode = !this.drawMode;
    if (this.drawMode) {
      this.startPoint = null;
      this.drawnPoints = [];
      this.camera.setPosition(new Vector3(0, 220, 0));
      this.camera.setTarget(new Vector3(0, 0, 0));
    } else {
      this.camera.setPosition(this.originalCameraPosition);
      this.camera.setTarget(this.originalCameraTarget);
    }
  }


  extrudeShape() {
    if (this.drawnPoints.length < 3) {
      alert('Minimum 3 points are required');
      this.clearSketch();
      return;
    }

    // Clear the previously drawn lines
    this.geometries.forEach(geom => {
      if (geom.name.startsWith('line')) {
        geom.dispose(); // Dispose of the line mesh
      }
    });

    const pointsToSend = this.drawnPoints.map(point => ({ x: point.x, z: point.z }));
    this.game._room!.send("SendDrawpoints", pointsToSend);

    const shape = this.drawnPoints.map(p => new Vector3(p.x, 0, p.z));

    const extrudedMesh = MeshBuilder.ExtrudePolygon(
      `geometry${Date.now()}`,
      {
        shape,
        depth: 10,
        sideOrientation: Mesh.DOUBLESIDE,
        updatable: true,
        wrap: true,
      },
      this.scene,
      earcut
    );

    extrudedMesh.position.y = 1;  // Adjust position slightly above the ground
    extrudedMesh.convertToFlatShadedMesh();  // Solid appearance

    const material = new StandardMaterial('geometryMaterial', this.scene);
    material.diffuseColor = new Color3(0.1, 0.8, 0.1);
    extrudedMesh.material = material;

    // Set the selected geometry to the newly created extruded mesh
    //console.log(typeof extrudedMesh);
    this.selectedGeometry = extrudedMesh;

    this.geometries.push(extrudedMesh);
    this.clearSketch();
  }

  private clearSketch() {
    this.startPoint = null;
    // this.drawnPoints = [];
  }

  private setGeometries(updateFn: (prevItems: Mesh[]) => Mesh[]) {
    this.geometries = updateFn(this.geometries);
  }

  private defaultGeometryMaterial(): StandardMaterial {
    const material = new StandardMaterial('defaultMaterial', this.scene);
    material.diffuseColor = new Color3(0.8, 0.8, 0.8);  // Default gray color
    return material;
  }

  private onResize() {
    this.engine.resize();
  }
}
