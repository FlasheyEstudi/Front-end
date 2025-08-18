import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaConocimientoComponent } from './area-conocimiento.component';

describe('AreaConocimientoComponent', () => {
  let component: AreaConocimientoComponent;
  let fixture: ComponentFixture<AreaConocimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaConocimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaConocimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
