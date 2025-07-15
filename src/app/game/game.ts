import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-game',
  imports: [
    MatButtonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class Game implements OnInit, AfterViewInit {
  @ViewChild('myCanvas')
  private canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private gameGridWidth: number = 7;
  private gameGridHeight: number = 6;
  private radius: number = 10;
  private pixelsBetweenTokens: number = 10;
  private playerColors: string[] = [
    "blue",
    "red"
  ];
  private gameState: number[][] = [];
  private availablePixelsX!: number;
  private availablePixelsY!: number;
  private cellSizeX!: number;

  ngOnInit(): void {
    for (let y = 0; y < this.gameGridHeight; y++) {
      this.gameState.push([]);

      for (let x = 0; x < this.gameGridWidth; x++) {
        this.gameState[y].push(1)
      }
    }
  }

  ngAfterViewInit(): void {
    this.availablePixelsX = this.canvas.nativeElement.width;
    this.availablePixelsY = this.canvas.nativeElement.height;
    this.cellSizeX = this.availablePixelsX / this.gameGridWidth;
    this.context = this.canvas.nativeElement.getContext('2d')!;

    this.renderGameState();
  }

  private renderGameState(): void {
    this.context.reset();
    this.drawSeparators();

    let currentPosY = this.availablePixelsY - this.radius;

    for (let y = 0; y < this.gameGridHeight; y++) {
      let currentPosX = this.cellSizeX / 2;

      for (let x = 0; x < this.gameGridWidth; x++) {
        if (this.gameState[y][x] !== 0) {
          this.drawToken(currentPosX, currentPosY, this.playerColors[this.gameState[y][x] - 1]);
        }

        currentPosX += this.cellSizeX;
      }

      currentPosY -= this.radius + this.pixelsBetweenTokens;
    }
  }

  private drawSeparators() {
    let currentPosX = 0;

    for (let x = 0; x <= this.gameGridWidth; x++) {
      this.context.strokeStyle = "brown";
      this.context.moveTo(currentPosX, 0);
      this.context.lineTo(currentPosX, this.availablePixelsY);
      this.context.stroke();

      currentPosX += this.cellSizeX;
    }
  }

  private drawToken(posX: number, posY: number, color: string): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(posX, posY, this.radius, 0, 2 * Math.PI);
    this.context.fill();
  }
}
