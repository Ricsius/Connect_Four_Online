import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  imports: [
    MatGridListModule,
    MatButtonModule,
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.css'
})
export class MainMenu {

}
