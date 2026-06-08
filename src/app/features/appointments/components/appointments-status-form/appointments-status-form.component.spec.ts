import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsStatusFormComponent } from './appointments-status-form.component';

describe('AppointmentsStatusFormComponent', () => {
  let component: AppointmentsStatusFormComponent;
  let fixture: ComponentFixture<AppointmentsStatusFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsStatusFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsStatusFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
