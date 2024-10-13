import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import gameConfig from 'backend/src/game.config';
import { GameState } from 'backend/src/rooms/schema/GameState';
import * as Colyseus from 'colyseus.js';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  public kickEvent = new Subject<void>();
  public roomErrorEvent = new Subject<string>();
  public joinInProgress = false;
  public connectedBefore = false;

  public _room?: Colyseus.Room<GameState>;
  public pingTimeout?: number;
  public client: Colyseus.Client;

  public get room() {
    return this._room;
  }

  


  public get player() {
    return this._room?.state.players.get(this._room.sessionId);
  }

  constructor(private router: Router) {
    this.client = new Colyseus.Client(environment.gameServer);
  }

  public createRoom() {
    return this.updateRoom(() => this.client.create('gameRoom'), true);
  }

  public joinRoom(id: String) {
    return this.updateRoom(() => this.client.joinById(id.toUpperCase()), true);
   
  }



  public setReadyState(newState: boolean) {
    this.room?.send('ready', newState);
  }

  public setAutoReadyState(newState: boolean) {
    this.room?.send('autoReady', newState);
  }





  public async updateRoom(
    room: () => Promise<Colyseus.Room<GameState>>,
    emitErrorEvent = false,
    deleteRoomDataOnInvalidRoomId = false
  ) {
    if (this.joinInProgress) return false;
    this.joinInProgress = true;

    try {
      this._room = await room();
    } catch (error: any) {
      //Was not able to connect

      this.joinInProgress = false;
      return false;
    }

    // Connected

    this.connectedBefore = true;
    console.log(this._room.id);
    localStorage.setItem('roomId', this._room.id);


    this._room.onLeave((code) => {
      this._room = undefined;
      window.clearTimeout(this.pingTimeout);


      // Abnormal websocket shutdown
      if (code == 1006) this.roomErrorEvent.next('Lost connection to server');

      this.router.navigate(['/']);
    });


    this.router.navigate(['/room', this._room.id], {
      queryParams: { session: this._room.sessionId },
    });

    this.joinInProgress = false;
    return true;
  }

  /**
   * Saves room data to localStorage
   */
  private saveRoomData(room: Colyseus.Room) {
    localStorage.setItem('roomId', room.id);
    localStorage.setItem('sessionId', room.sessionId);
  }

  
  private convertRoomErrorToMessage(error: any): string {
    if (error instanceof ProgressEvent) return `Can't connect to server`;

    if (error?.code === gameConfig.roomFullCode) return 'Room is full';
    if (error?.code === Colyseus.ErrorCode.MATCHMAKE_INVALID_ROOM_ID)
      return 'Invalid room ID';

    return 'Internal server error';
  }
}
