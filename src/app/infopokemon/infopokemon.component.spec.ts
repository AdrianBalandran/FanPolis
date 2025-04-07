import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfopokemonComponent } from './infopokemon.component';

describe('InfopokemonComponent', () => {
  let component: InfopokemonComponent;
  let fixture: ComponentFixture<InfopokemonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfopokemonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfopokemonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
