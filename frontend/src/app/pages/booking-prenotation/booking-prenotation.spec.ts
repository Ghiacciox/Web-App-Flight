import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPrenotationComponent } from './booking-prenotation';

describe('BookingPrenotation', () => {
  let component: BookingPrenotationComponent;
  let fixture: ComponentFixture<BookingPrenotationComponent>;   
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPrenotationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPrenotationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
