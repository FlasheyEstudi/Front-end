import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitoComponent } from './requisito.component';

describe('RequisitoComponent', () => {
  let component: RequisitoComponent;
  let fixture: ComponentFixture<RequisitoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequisitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
