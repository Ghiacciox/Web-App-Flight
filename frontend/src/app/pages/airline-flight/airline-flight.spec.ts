import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineFlightComponent } from './airline-flight';

describe('AirlineFlightComponent', () => {
  let component: AirlineFlightComponent;
  let fixture: ComponentFixture<AirlineFlightComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineFlightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineFlightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
