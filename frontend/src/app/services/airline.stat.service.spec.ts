import { TestBed } from '@angular/core/testing';

import { AirlineStatService } from './airline.stat.service';

describe('AirlineStatService', () => {
  let service: AirlineStatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirlineStatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
