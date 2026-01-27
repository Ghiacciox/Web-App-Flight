import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCreation } from './booking-creation';

describe('BookingCreation', () => {
  let component: BookingCreation;
  let fixture: ComponentFixture<BookingCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCreation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
