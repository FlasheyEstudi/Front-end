import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacioComponent } from './vacio.component';

describe('VacioComponent', () => {
  let component: VacioComponent;
  let fixture: ComponentFixture<VacioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
