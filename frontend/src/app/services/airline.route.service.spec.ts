import { TestBed } from '@angular/core/testing';

import { AirlineRouteService } from './airline.route.service';

describe('AirlineRouteService', () => {
  let service: AirlineRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirlineRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
