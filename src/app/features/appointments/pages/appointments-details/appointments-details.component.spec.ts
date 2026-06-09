import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsDetailsComponent } from './appointments-details.component';

describe('AppointmentsDetailsComponent', () => {
  let component: AppointmentsDetailsComponent;
  let fixture: ComponentFixture<AppointmentsDetailsComponent>;

  let appointmentServiceMock = { get: vi.fn() };

  const mockAppointment: AppointmentResponse = {
    id: 1,
    slotId: 10,
    userId: 5,
    patientName: 'Alice',
    doctorName: 'Dr. Smith',
    specialization: 'Cardiology',
    date: new Date('2024-01-01'),
    startTime: new Date('2024-01-01T09:00:00'),
    endTime: new Date('2024-01-01T09:30:00'),
    status: AppointmentStatus.Pending,
    bookedAt: new Date('2023-12-01T10:00:00'),
  };

  beforeEach(async () => {
    appointmentServiceMock.get.mockReturnValue(of(mockAppointment));
    await TestBed.configureTestingModule({
      imports: [AppointmentsDetailsComponent],
      providers: [{ provide: AppointmentService, useValue: appointmentServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsDetailsComponent);
    fixture.componentRef.setInput('id', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
