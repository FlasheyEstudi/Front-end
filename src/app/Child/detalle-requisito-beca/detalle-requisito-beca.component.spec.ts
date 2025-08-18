import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRequisitoBecaComponent } from './detalle-requisito-beca.component';

describe('DetalleRequisitoBecaComponent', () => {
  let component: DetalleRequisitoBecaComponent;
  let fixture: ComponentFixture<DetalleRequisitoBecaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRequisitoBecaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleRequisitoBecaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
