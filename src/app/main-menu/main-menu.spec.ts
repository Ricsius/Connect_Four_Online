import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenu } from './main-menu';

describe('MainMenu', () => {
  let component: MainMenu;
  let fixture: ComponentFixture<MainMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(MainMenu);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Connect 4 Online');
  });
});
