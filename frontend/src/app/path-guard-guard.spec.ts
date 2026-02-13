import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pathGuardGuard } from './path-guard-guard';

describe('pathGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pathGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
