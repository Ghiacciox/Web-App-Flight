import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineAirplanes } from './airline-airplanes';

describe('AirlineAirplanes', () => {
  let component: AirlineAirplanes;
  let fixture: ComponentFixture<AirlineAirplanes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineAirplanes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineAirplanes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
