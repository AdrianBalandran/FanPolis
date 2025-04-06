import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmpageComponent } from './rmpage.component';

describe('RmpageComponent', () => {
  let component: RmpageComponent;
  let fixture: ComponentFixture<RmpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RmpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RmpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
