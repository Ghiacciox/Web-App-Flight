import { TestBed } from '@angular/core/testing';

import { AirlineAirplaneService } from './airline.airplane.service';

describe('AirlineAirplaneService', () => {
  let service: AirlineAirplaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirlineAirplaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
