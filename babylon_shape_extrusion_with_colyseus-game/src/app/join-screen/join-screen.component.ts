import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import gameConfig from 'backend/src/game.config';
import { GameService } from '../game.service';


@Component({
  selector: 'app-join-screen',
  templateUrl: './join-screen.component.html',
  styleUrls: ['./join-screen.component.css'],
})
export class JoinScreenComponent {
  public roomId: string = '';

  joinButtonInvalidTooltip = `Room ID needs to be ${gameConfig.roomIdLength} letters long.`;

  constructor(public game: GameService) {}
}
