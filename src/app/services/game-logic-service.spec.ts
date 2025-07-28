import { TestBed } from '@angular/core/testing';

import { GameLogicService } from './game-logic-service';
import { GameMode, GameOutcome, GameState } from './game-logic.model';
import { Subscription } from 'rxjs';

type GameSimulationInput = {
  player1Moves: number[];
  player2Moves: number[];
  expectedTokenMatrix: number[][];
  expectedEndOutcome: GameOutcome;
};

describe('GameLogicService', () => {
  let service: GameLogicService;
  let subscription: Subscription | null;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameLogicService);
    subscription = null;
  });

  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('the game should start with an initial empty state', () => {
    service.startGame(GameMode.LocalMultiplayer);

    const gameState = service.gameStateUpdates$.getValue();
    const noTokensPresent = gameState.tokenMatrix.every(r => r.every(t => t === 0));

    expect(noTokensPresent).withContext('The board should be empty').toBeTrue();
    expect(gameState.currentPlayer).withContext('Player 1 should start').toBe(1);
    expect(gameState.newTokenColIndex).withContext('The current player\'s token should be above the first column').toBe(0);
    expect(gameState.outcome).withContext('The board should be empty').toBe(GameOutcome.InProgress);
  });

  it('the player shouldn\'t be able to navigate to non-existent columns', () => {
    service.startGame(GameMode.LocalMultiplayer);

    let expectedNewTokenColIndex: number = 0;
    const gameGridWidth: number = service.gameStateUpdates$.getValue().gameGridWidth;

    subscription = service.gameStateUpdates$.subscribe(gs => {
      expect(gs.newTokenColIndex)
        .withContext(`The current player\'s token should be above column ${expectedNewTokenColIndex + 1}`)
        .toBe(expectedNewTokenColIndex);
    });

    for (let i: number = 1; i <= gameGridWidth * 10; i++) {
      expectedNewTokenColIndex = i % gameGridWidth;
      service.moveNewTokenRight();
    }

    for (let i: number = (gameGridWidth * 10) - 1; i >= 0; i--) {
      expectedNewTokenColIndex = i % gameGridWidth;
      service.moveNewTokenLeft();
    }
  });

  it('the game should recognize it\'s outcome', () => {
    const simulationInputs: GameSimulationInput[] = [
      {
        player1Moves: [2, 4, 2, 3, 5, 4],
        player2Moves: [0, 1, 3, 5, 1],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 2, 1, 1, 1, 1, 0],
          [2, 2, 1, 2, 1, 2, 0],
        ],
        expectedEndOutcome: GameOutcome.Player1Won
      },
      {
        player1Moves: [0, 1, 3, 5, 1, 6],
        player2Moves: [2, 4, 2, 3, 5, 4],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 1, 2, 2, 2, 2, 0],
          [1, 1, 2, 1, 2, 1, 1],
        ],
        expectedEndOutcome: GameOutcome.Player2Won
      },
      {
        player1Moves: [0, 6, 3, 3, 3, 3],
        player2Moves: [3, 3, 1, 2, 5],
        expectedTokenMatrix: [
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 2, 0, 0, 0],
          [1, 2, 2, 2, 0, 2, 1],
        ],
        expectedEndOutcome: GameOutcome.Player1Won
      },
      {
        player1Moves: [3, 3, 1, 2, 5, 0],
        player2Moves: [0, 6, 3, 3, 3, 3],
        expectedTokenMatrix: [
          [0, 0, 0, 2, 0, 0, 0],
          [0, 0, 0, 2, 0, 0, 0],
          [0, 0, 0, 2, 0, 0, 0],
          [0, 0, 0, 2, 0, 0, 0],
          [1, 0, 0, 1, 0, 0, 0],
          [2, 1, 1, 1, 0, 1, 2],
        ],
        expectedEndOutcome: GameOutcome.Player2Won
      },
      {
        player1Moves: [4, 3, 2, 0, 6, 1, 3],
        player2Moves: [2, 2, 1, 1, 1, 5],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 0, 0, 0, 0],
          [0, 2, 1, 0, 0, 0, 0],
          [0, 2, 2, 1, 0, 0, 0],
          [1, 2, 2, 1, 1, 2, 1],
        ],
        expectedEndOutcome: GameOutcome.Player1Won
      },
      {
        player1Moves: [2, 2, 1, 1, 1, 5, 6],
        player2Moves: [4, 3, 2, 0, 6, 1, 3],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 2, 0, 0, 0, 0, 0],
          [0, 1, 2, 0, 0, 0, 0],
          [0, 1, 1, 2, 0, 0, 1],
          [2, 1, 1, 2, 2, 1, 2],
        ],
        expectedEndOutcome: GameOutcome.Player2Won
      },
      {
        player1Moves: [6, 6, 5, 6, 5, 6, 4, 3, 4, 6],
        player2Moves: [5, 5, 6, 5, 4, 3, 3, 4, 1],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 1],
          [0, 0, 0, 0, 0, 1, 1],
          [0, 0, 0, 0, 1, 2, 1],
          [0, 0, 0, 1, 2, 1, 2],
          [0, 0, 0, 2, 1, 2, 1],
          [0, 2, 0, 2, 2, 2, 1],
        ],
        expectedEndOutcome: GameOutcome.Player1Won
      },
      {
        player1Moves: [5, 5, 6, 5, 4, 3, 3, 4, 1, 0],
        player2Moves: [6, 6, 5, 6, 5, 6, 4, 3, 4, 6],
        expectedTokenMatrix: [
          [0, 0, 0, 0, 0, 0, 2],
          [0, 0, 0, 0, 0, 2, 2],
          [0, 0, 0, 0, 2, 1, 2],
          [0, 0, 0, 2, 1, 2, 1],
          [0, 0, 0, 1, 2, 1, 2],
          [1, 1, 0, 1, 1, 1, 2],
        ],
        expectedEndOutcome: GameOutcome.Player2Won
      },
      {
        player1Moves: [0, 2, 4, 6, 0, 2, 4, 6, 0, 2, 4, 6, 1, 3, 5, 1, 3, 5, 1, 3, 5],
        player2Moves: [1, 3, 5, 1, 3, 5, 1, 3, 5, 0, 2, 4, 6, 0, 2, 4, 6, 0, 2, 4, 6],
        expectedTokenMatrix: [
          [2, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 1, 2, 1, 2],
          [2, 1, 2, 1, 2, 1, 2],
          [1, 2, 1, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 1],
          [1, 2, 1, 2, 1, 2, 1],
        ],
        expectedEndOutcome: GameOutcome.Draw
      },
    ];

    simulationInputs.forEach(input => simulateGamePlay(input));
  });

  it('the players shouldn\'t be able to modify the game state after it has ended', () => {
    const simulationInput: GameSimulationInput = {
      player1Moves: [2, 4, 2, 3, 5, 4],
      player2Moves: [0, 1, 3, 5, 1],
      expectedTokenMatrix: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 2, 1, 1, 1, 1, 0],
        [2, 2, 1, 2, 1, 2, 0],
      ],
      expectedEndOutcome: GameOutcome.Player1Won
    };

    simulateGamePlay(simulationInput);

    let gameStateUpdates: number = -1;

    subscription = service.gameStateUpdates$.subscribe(_ => {
      ++gameStateUpdates;
    });

    service.moveNewTokenLeft();
    service.moveNewTokenRight();
    service.dropToken();

    expect(gameStateUpdates).withContext('The game state should stay unchanged').toBe(0);
  })

  function simulateGamePlay(input: GameSimulationInput): void {
    const moves: number[] = [];
    const length: number = input.player1Moves.length + input.player2Moves.length;
    let index: number = 0;

    service.startGame(GameMode.LocalMultiplayer);

    while (moves.length < length) {
      if (index < input.player1Moves.length) {
        moves.push(input.player1Moves[index]);
      }

      if (index < input.player2Moves.length) {
        moves.push(input.player2Moves[index]);
      }

      ++index;
    }

    for (let i = 0; i < moves.length - 1; i++) {
      executeMove(moves[i]);
      expect(service.gameStateUpdates$.getValue().outcome)
        .withContext(`The game's current outcome should be ${GameOutcome.InProgress}`)
        .toBe(GameOutcome.InProgress);
    }

    executeMove(moves[moves.length - 1]);
    expect(service.gameStateUpdates$.getValue().outcome)
      .withContext(`The simulation should end with outcome ${input.expectedEndOutcome}`)
      .toBe(input.expectedEndOutcome);

    const gameState: GameState = service.gameStateUpdates$.getValue();
    const tokenMatrix: number[][] = gameState.tokenMatrix;
    compareTokenMatrices(tokenMatrix, input.expectedTokenMatrix);
  }

  function compareTokenMatrices(matrix1: number[][], matrix2: number[][]): void {
    let y: number = 0;
    let tokenMatrixMatch: boolean = true;
    const gameState: GameState = service.gameStateUpdates$.getValue();
    const gameGridHeight = gameState.gameGridHeight;
    const gameGridWidth = gameState.gameGridWidth;

    while (tokenMatrixMatch && y < gameGridHeight) {
      let x: number = 0;

      while (tokenMatrixMatch && x < gameGridWidth) {
        tokenMatrixMatch = matrix1[y][x] === matrix2[y][x];

        ++x;
      }

      ++y;
    }

    expect(tokenMatrixMatch).withContext(`The game's token matrix should match expectations`).toBeTrue();
  }

  function executeMove(move: number): void {
    while (service.gameStateUpdates$.getValue().newTokenColIndex !== move) {
      service.moveNewTokenRight();
    }

    service.dropToken();
  }
});