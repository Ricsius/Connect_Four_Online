import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GameOutcome, GameState } from '../services/game-logic.model';
import { GameLogicService } from '../services/game-logic-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [MatButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myCanvas')
  private readonly canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private gameGridWidth!: number;
  private gameGridHeight!: number;
  private readonly radius: number = 10;
  private readonly pixelsBetweenTokens: number = 10;
  private readonly playerColors: string[] = ['blue', 'red'];
  private readonly separatorColor: string = 'brown';
  private readonly newTokenOutlineColor: string = 'green';
  private readonly outcomeTextBackgroundColor: string = 'black';
  private readonly outcomeTextColor: string = 'yellow';
  private readonly outcomeTextFont: string = '15px sans serif';
  private readonly moveLeftKey: string = 'a';
  private readonly moveRightKey: string = 'd';
  private readonly dropTokenKey: string = ' ';
  private availablePixelsX!: number;
  private availablePixelsY!: number;
  private cellSizeX!: number;
  private gameState!: GameState;
  private gameStateUpdateSubscription!: Subscription;
  private readonly onKeyDownLambda: any = (e: KeyboardEvent) =>
    this.onKeyDown(e);

  constructor(private gameLogicService: GameLogicService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.gameGridWidth =
      this.gameLogicService.gameStateUpdates$.getValue().gameGridWidth;
    this.gameGridHeight =
      this.gameLogicService.gameStateUpdates$.getValue().gameGridHeight;
    this.availablePixelsX = this.canvas.nativeElement.width;
    this.availablePixelsY = this.canvas.nativeElement.height;
    this.cellSizeX = this.availablePixelsX / this.gameGridWidth;
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.gameStateUpdateSubscription =
      this.gameLogicService.gameStateUpdates$.subscribe((gs) =>
        this.onGameStateUpdate(gs)
      );

    document.addEventListener('keydown', this.onKeyDownLambda);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDownLambda);
    this.gameStateUpdateSubscription.unsubscribe();
  }

  private renderGameState(): void {
    this.context.reset();
    this.drawSeparators();
    this.drawTokens();
  }

  private drawSeparators(): void {
    let currentPosX: number = 0;

    for (let x = 0; x <= this.gameGridWidth; x++) {
      this.context.strokeStyle = this.separatorColor;
      this.context.moveTo(currentPosX, 0);
      this.context.lineTo(currentPosX, this.availablePixelsY);
      this.context.stroke();

      currentPosX += this.cellSizeX;
    }
  }

  private drawTokens(): void {
    let currentPosY = this.availablePixelsY - this.radius;

    for (let y = this.gameGridHeight - 1; y >= 0; y--) {
      let currentPosX = this.cellSizeX / 2;

      for (let x = 0; x < this.gameGridWidth; x++) {
        if (this.gameState.tokenMatrix[y][x] !== 0) {
          this.drawToken(
            currentPosX,
            currentPosY,
            this.playerColors[this.gameState.tokenMatrix[y][x] - 1]
          );
        }

        currentPosX += this.cellSizeX;
      }

      currentPosY -= this.radius + this.pixelsBetweenTokens;
    }

    const posX: number =
      this.cellSizeX / 2 + this.cellSizeX * this.gameState.newTokenColIndex;

    this.context.strokeStyle = this.newTokenOutlineColor;
    this.context.beginPath();
    this.context.arc(posX, currentPosY, this.radius + 1, 0, 2 * Math.PI);
    this.context.stroke();

    this.drawToken(
      posX,
      currentPosY,
      this.playerColors[this.gameState.currentPlayer - 1]
    );
  }

  private drawToken(posX: number, posY: number, color: string): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(posX, posY, this.radius, 0, 2 * Math.PI);
    this.context.fill();
  }

  private onGameStateUpdate(gameState: GameState) {
    this.gameState = gameState;

    this.renderGameState();

    if (this.gameState.outcome !== GameOutcome.InProgress) {
      let outcomeText: string = '';

      switch (this.gameState.outcome) {
        case GameOutcome.Player1Won:
        case GameOutcome.Player2Won: {
          outcomeText = `Player ${this.gameState.outcome} won`;
          break;
        }
        case GameOutcome.Draw: {
          outcomeText = 'Draw';
          break;
        }
      }

      this.drawOutcomeText(outcomeText);
    }
  }

  private drawOutcomeText(text: string): void {
    this.context.font = this.outcomeTextFont;

    const rectWidth: number = 100;
    const rectHeight: number = 50;
    const posX: number = this.availablePixelsX / 2 - rectWidth / 2;
    const posY: number = this.availablePixelsY / 2 - rectHeight / 2;
    const textMetrics: TextMetrics = this.context.measureText(text);
    const textHeight: number =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;
    const textPosX: number = posX + rectWidth / 2 - textMetrics.width / 2;
    const textPosY: number = posY + rectHeight / 2 + textHeight / 2;

    this.context.fillStyle = this.outcomeTextBackgroundColor;
    this.context.fillRect(posX, posY, rectWidth, rectHeight);

    this.context.fillStyle = this.outcomeTextColor;
    this.context.fillText(text, textPosX, textPosY);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (
      this.gameLogicService.currentControllerIdentifyer !==
        this.gameLogicService.myControllerIdentifyer ||
      this.gameLogicService.gameStateUpdates$.value.outcome !==
        GameOutcome.InProgress
    ) {
      return;
    }

    switch (e.key) {
      case this.moveLeftKey: {
        this.gameLogicService.moveNewTokenLeft();
        break;
      }
      case this.moveRightKey: {
        this.gameLogicService.moveNewTokenRight();
        break;
      }
      case this.dropTokenKey: {
        this.gameLogicService.dropToken();
        break;
      }
    }
  }
}
