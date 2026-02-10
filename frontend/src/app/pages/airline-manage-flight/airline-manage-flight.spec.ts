import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineManageFlightComponent } from './airline-manage-flight';

describe('AirlineManageFlightComponent', () => {
  let component: AirlineManageFlightComponent;
  let fixture: ComponentFixture<AirlineManageFlightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineManageFlightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineManageFlightComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
