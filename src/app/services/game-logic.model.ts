export enum GameMode {
    Singleplayer,
    LocalMultiplayer,
}

export enum GameOutcome {
    InProgress = 0,
    Player1Won = 1,
    Player2Won = 2,
    Draw = 3
}

export class GameState {
    currentPlayer!: number;
    newTokenColIndex!: number;
    outcome: GameOutcome;
    readonly tokenMatrix: number[][] = [];
    readonly gameGridWidth: number = 7;
    readonly gameGridHeight: number = 6;

    constructor()
    constructor(gameState: GameState)
    constructor(gameState?: GameState) {
        this.currentPlayer = gameState?.currentPlayer ?? 1;
        this.newTokenColIndex = gameState?.newTokenColIndex ?? 0;
        this.outcome = gameState?.outcome ?? GameOutcome.InProgress;

        for (let y = 0; y < this.gameGridHeight; y++) {
            this.tokenMatrix.push([]);
            for (let x = 0; x < this.gameGridWidth; x++) {
                this.tokenMatrix[y][x] = gameState?.tokenMatrix[y][x] ?? 0;
            }
        }
    }
}