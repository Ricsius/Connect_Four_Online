import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { GameMode } from '../services/game-logic.model';
import { GameLogicService } from '../services/game-logic-service';

@Component({
  selector: 'app-main-menu',
  imports: [
    MatGridListModule,
    MatButtonModule,
  ],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.css'
})
export class MainMenu implements OnInit {
  gameModeLabels: Map<GameMode, string> = new Map<GameMode, string>();
  disabledGameModes: GameMode[] = [GameMode.Singleplayer];

  constructor(private gameLogicService: GameLogicService) {}

  ngOnInit(): void {
    this.gameModeLabels.set(GameMode.Singleplayer, 'Singleplayer');
    this.gameModeLabels.set(GameMode.LocalMultiplayer, 'Local Multiplayer');
  }

  selectGameMode(gameMode: GameMode): void {
    if(this.disabledGameModes.includes(gameMode)) {
      return;
    }

    this.gameLogicService.startGame(gameMode);
  }
}
