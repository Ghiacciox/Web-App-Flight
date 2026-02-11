import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddUser } from './admin-add-user';

describe('AdminAddUser', () => {
  let component: AdminAddUser;
  let fixture: ComponentFixture<AdminAddUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAddUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
