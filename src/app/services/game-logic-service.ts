import { Injectable } from '@angular/core';
import { GameMode, GameOutcome, GameState } from './game-logic.model';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {
  myControllerIdentifyer!: string;
  gameStateUpdates$!: BehaviorSubject<GameState>;
  readonly playerControllerIdentifyers: Map<number, string> = new Map<number, string>();
  private gameState!: GameState;
  private readonly localControllerIdentifyer = "LOCAL";
  private readonly aiControllerIdentifyer = "AI";

  constructor(private router: Router) { }

  get currentControllerIdentifyer(): string {
    return this.playerControllerIdentifyers.get(this.gameState.currentPlayer)!;
  }

  startGame(gameMode: GameMode): void {
    this.playerControllerIdentifyers.clear();

    switch (gameMode) {
      case GameMode.Singleplayer: {
        this.playerControllerIdentifyers.set(1, this.localControllerIdentifyer);
        this.playerControllerIdentifyers.set(2, this.aiControllerIdentifyer);
        this.myControllerIdentifyer = this.localControllerIdentifyer;
        break;
      }
      case GameMode.LocalMultiplayer: {
        this.playerControllerIdentifyers.set(1, this.localControllerIdentifyer);
        this.playerControllerIdentifyers.set(2, this.localControllerIdentifyer);
        this.myControllerIdentifyer = this.localControllerIdentifyer;
        break;
      }
      default: {
        return;
      }
    }

    this.gameState = new GameState();
    this.gameStateUpdates$ = new BehaviorSubject<GameState>(this.gameState);
    this.router.navigate(['/game']);
  }

  moveNewTokenRight() {
    this.moveNewToken(1);
  }

  moveNewTokenLeft() {
    this.moveNewToken(-1);
  }

  dropToken(): void {
    const colIndex: number = this.gameState.newTokenColIndex;
    const tokenMatrix: number[][] = this.gameState.tokenMatrix;

    if (this.currentControllerIdentifyer !== this.myControllerIdentifyer
      || this.gameState.outcome !== GameOutcome.InProgress
      || tokenMatrix[0][colIndex] !== 0) {
      return;
    }

    let y: number = 0;

    while (y < this.gameState.gameGridHeight - 1 && tokenMatrix[y + 1][colIndex] == 0) {
      ++y;
    }

    tokenMatrix[y][colIndex] = this.gameState.currentPlayer;

    if (this.checkWinConditionForToken(colIndex, y)) {
      this.gameState.outcome = this.gameState.currentPlayer;
    }
    else if (this.gameState.tokenMatrix.every(r => r.every(t => t !== 0))) {
      this.gameState.outcome = GameOutcome.Draw;
    }
    else {
      this.gameState.currentPlayer = Math.abs(this.gameState.currentPlayer - 3);
      this.gameState.newTokenColIndex = 0;
    }

    this.sendGameStateUpdate();
  }

  private moveNewToken(n: number) {
    if (this.currentControllerIdentifyer !== this.myControllerIdentifyer 
      || this.gameState.outcome !== GameOutcome.InProgress) {
      return;
    }

    let newIndex: number = (this.gameState.newTokenColIndex + n) % this.gameState.gameGridWidth;

    if(newIndex < 0) {
      newIndex += this.gameState.gameGridWidth;
    }

    this.gameState.newTokenColIndex = newIndex;

    this.sendGameStateUpdate();
  }

  private checkWinConditionForToken(x: number, y: number): boolean {
    const tokenMatrix: number[][] = this.gameState.tokenMatrix;
    const player: number = tokenMatrix[y][x];

    if (player !== 1 && player !== 2) {
      return false;
    }

    let length: number = 0;
    let i: number = 0;

    const directions: [number, number][] = [
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ];

    while (length < 4 && i < directions.length) {
      const dx: number = directions[i][0];
      const dy: number = directions[i][1];
      const xRange = [...Array(this.gameState.gameGridWidth).keys()];
      const yRange = [...Array(this.gameState.gameGridHeight).keys()];
      let distance: number = 1;
      let stopFlag1: boolean = false;
      let stopFlag2: boolean = false;

      length = 1;

      while (!stopFlag1 || !stopFlag2) {
        const newX1: number = x + (dx * distance);
        const newY1: number = y + (dy * distance);
        const newX2: number = x + (-dx * distance);
        const newY2: number = y + (-dy * distance);

        if (!xRange.includes(newX1) || !yRange.includes(newY1)) {
          stopFlag1 = true;
        }

        if (!xRange.includes(newX2) || !yRange.includes(newY2)) {
          stopFlag2 = true;
        }

        if (!stopFlag1 && tokenMatrix[newY1][newX1] === player) {
          ++length
        }
        else {
          stopFlag1 = true;
        }

        if (!stopFlag2 && tokenMatrix[newY2][newX2] === player) {
          ++length
        }
        else {
          stopFlag2 = true;
        }

        ++distance;
      }

      ++i;
    }

    return length >= 4;
  }

  private sendGameStateUpdate() {
    this.gameStateUpdates$.next(new GameState(this.gameState));
  }
}
