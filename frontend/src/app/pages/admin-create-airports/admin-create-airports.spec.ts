import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateAirportsComponent } from './admin-create-airports';

describe('AdminCreateAirportsComponent', () => {
  let component: AdminCreateAirportsComponent;
  let fixture: ComponentFixture<AdminCreateAirportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCreateAirportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreateAirportsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
