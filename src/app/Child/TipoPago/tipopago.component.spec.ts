import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoPagoComponent } from './tipopago.component';

describe('TipoPagoComponent', () => {
  let component: TipoPagoComponent;
  let fixture: ComponentFixture<TipoPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
