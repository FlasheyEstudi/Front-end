import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnuPrincipalComponent } from './mnu-principal.component';

describe('MnuPrincipalComponent', () => {
  let component: MnuPrincipalComponent;
  let fixture: ComponentFixture<MnuPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnuPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnuPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
