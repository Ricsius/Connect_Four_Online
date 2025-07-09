import { Routes } from '@angular/router';
import { MainMenu } from './main-menu/main-menu';
import { Game } from './game/game';

export const routes: Routes = [
    { path: '', component: MainMenu },
    { path: 'game', component: Game },
];
