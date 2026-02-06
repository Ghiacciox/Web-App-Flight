import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineRoutesComponent } from './airline-routes';

describe('AirlineRoutes', () => {
  let component: AirlineRoutesComponent;
  let fixture: ComponentFixture<AirlineRoutesComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineRoutesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineRoutesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
