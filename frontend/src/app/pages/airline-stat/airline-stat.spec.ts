import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineStatComponent } from './airline-stat';

describe('AirlineStatComponent', () => {
  let component: AirlineStatComponent;
  let fixture: ComponentFixture<AirlineStatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineStatComponent  ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineStatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
