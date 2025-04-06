import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PkpageComponent } from './pkpage.component';

describe('PkpageComponent', () => {
  let component: PkpageComponent;
  let fixture: ComponentFixture<PkpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PkpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PkpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
