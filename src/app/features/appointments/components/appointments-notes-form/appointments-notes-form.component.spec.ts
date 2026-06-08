import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsNotesFormComponent } from './appointments-status-form.component';

describe('AppointmentsNotesFormComponent', () => {
  let component: AppointmentsNotesFormComponent;
  let fixture: ComponentFixture<AppointmentsNotesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsNotesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsNotesFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
