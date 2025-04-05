import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaprinComponent } from './paginaprin.component';

describe('PaginaprinComponent', () => {
  let component: PaginaprinComponent;
  let fixture: ComponentFixture<PaginaprinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaprinComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaginaprinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
