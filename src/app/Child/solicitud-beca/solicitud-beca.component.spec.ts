import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudBecaComponent } from './solicitud-beca.component';

describe('SolicitudBecaComponent', () => {
  let component: SolicitudBecaComponent;
  let fixture: ComponentFixture<SolicitudBecaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudBecaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudBecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
