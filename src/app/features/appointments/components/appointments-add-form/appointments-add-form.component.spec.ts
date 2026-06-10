import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { DoctorService } from '../../../doctors/services/doctor.service';
import { AppointmentsAddFormComponent } from './appointments-add-form.component';

describe('AppointmentsAddFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsAddFormComponent>;
  let component: AppointmentsAddFormComponent;

  const mockSpecializations = [{ id: 1, name: 'Cardiology' }];
  const mockDoctors = [{ id: 10, name: 'Dr. Smith' }];
  const mockSlots = [{ id: 100, startTime: '09:00', endTime: '09:30' }];

  let appointmentServiceMock = { addAppointment: vi.fn() };
  let specializationServiceMock = { getAll: vi.fn() };
  let doctorServiceMock = { getAll: vi.fn() };
  let slotServiceMock = { getSlots: vi.fn() };
  let toastServiceMock = { success: vi.fn(), error: vi.fn() };
  let dialogRefMock = { close: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    specializationServiceMock.getAll.mockReturnValue(of(mockSpecializations));
    doctorServiceMock.getAll.mockReturnValue(of(mockDoctors));
    slotServiceMock.getSlots.mockReturnValue(of(mockSlots));

    await TestBed.configureTestingModule({
      imports: [AppointmentsAddFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: SpecializationService, useValue: specializationServiceMock },
        { provide: DoctorService, useValue: doctorServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialises with an invalid form', () => {
    expect(component.fg.invalid).toBe(true);
  });

  it('loads specialization options on init', () => {
    expect(specializationServiceMock.getAll).toHaveBeenCalled();
    expect(component.specializationOptions()).toEqual(mockSpecializations);
  });

  it('doctor control is disabled until a specialization is selected', () => {
    expect(component.f.doctor.disabled).toBe(true);
  });

  it('enables the doctor control when a specialization is selected', () => {
    component.f.specialization.setValue(1);
    expect(component.f.doctor.disabled).toBe(false);
  });

  it('loads doctor options when a specialization is selected', () => {
    component.f.specialization.setValue(1);
    expect(doctorServiceMock.getAll).toHaveBeenCalledWith(1);
    expect(component.doctorOptions()).toEqual(mockDoctors);
  });

  it('loads slot options when both doctor and date are set', () => {
    component.f.specialization.setValue(1);
    component.f.doctor.setValue(10);
    const date = new Date('2024-01-01');
    component.f.date.setValue(date);
    fixture.detectChanges();
    expect(slotServiceMock.getSlots).toHaveBeenCalledWith(10, date, date);
    expect(component.slotOptions()).toEqual(mockSlots);
  });

  it('marks all controls as touched and does not call the service when the form is invalid', () => {
    component.save();
    expect(component.f.specialization.touched).toBe(true);
    expect(appointmentServiceMock.addAppointment).not.toHaveBeenCalled();
  });

  it('calls the service with the correct payload when the form is valid', () => {
    appointmentServiceMock.addAppointment.mockReturnValue(of(void 0));
    component.f.specialization.setValue(1);
    component.f.doctor.setValue(10);
    component.f.date.setValue(new Date('2024-01-01'));
    component.f.slotId.setValue([100]);
    component.f.reason.setValue('Routine checkup');
    component.save();
    expect(appointmentServiceMock.addAppointment).toHaveBeenCalledWith({
      slotId: 100,
      reason: 'Routine checkup',
    });
  });

  it('shows a success toast and closes the dialog on success', () => {
    appointmentServiceMock.addAppointment.mockReturnValue(of(void 0));
    component.f.specialization.setValue(1);
    component.f.doctor.setValue(10);
    component.f.date.setValue(new Date('2024-01-01'));
    component.f.slotId.setValue([100]);
    component.save();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Appointment saved.');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('shows an error toast and does not close the dialog on failure', () => {
    const error = new Error('Server error');
    appointmentServiceMock.addAppointment.mockReturnValue(throwError(() => error));
    component.f.specialization.setValue(1);
    component.f.doctor.setValue(10);
    component.f.date.setValue(new Date('2024-01-01'));
    component.f.slotId.setValue([100]);
    component.save();
    expect(toastServiceMock.error).toHaveBeenCalledWith(error);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
