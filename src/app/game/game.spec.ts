import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Game } from './game';
import { GameLogicService } from '../services/game-logic-service';
import { GameMode } from '../services/game-logic.model';

describe('Game', () => {
  let component: Game;
  let fixture: ComponentFixture<Game>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [provideRouter([])]
    })
    .compileComponents();

    TestBed.inject(GameLogicService).startGame(GameMode.LocalMultiplayer);
    
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
