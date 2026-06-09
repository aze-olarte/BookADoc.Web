import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsStatusFormComponent } from './appointments-status-form.component';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('AppointmentsStatusFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsStatusFormComponent>;
  let component: AppointmentsStatusFormComponent;
  let appointmentServiceMock = {
    patchAppointmentStatus: vi.fn(),
    getStatusDropdownOptions: vi.fn().mockReturnValue(['Confirmed', 'Cancelled']),
  };
  let toastServiceMock = { success: vi.fn(), error: vi.fn() };
  let dialogRefMock = { close: vi.fn() };
  const mockInputData = { id: 1, status: AppointmentStatus.Pending, role: UserRole.Doctor };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppointmentsStatusFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: mockInputData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initialises with an empty invalid form', () => {
    expect(component.f.status.value).toBe('');
    expect(component.fg.invalid).toBe(true);
  });

  it('populates dropdown options from the service on init', () => {
    expect(appointmentServiceMock.getStatusDropdownOptions).toHaveBeenCalledWith(
      mockInputData.role,
      mockInputData.status,
    );
    expect(component.dropdownOptions()).toEqual(['Confirmed', 'Cancelled']);
  });

  it('marks all controls as touched and does not call the service when the form is invalid', () => {
    component.save();
    expect(component.f.status.touched).toBe(true);
    expect(appointmentServiceMock.patchAppointmentStatus).not.toHaveBeenCalled();
  });

  it('calls the service with the id and form value when the form is valid', () => {
    appointmentServiceMock.patchAppointmentStatus.mockReturnValue(of(void 0));
    component.f.status.setValue('Confirmed');
    component.save();
    expect(appointmentServiceMock.patchAppointmentStatus).toHaveBeenCalledWith(mockInputData.id, {
      status: 'Confirmed',
    });
  });

  it('shows a success toast and closes the dialog on success', () => {
    appointmentServiceMock.patchAppointmentStatus.mockReturnValue(of(void 0));
    component.f.status.setValue('Confirmed');
    component.save();
    expect(toastServiceMock.success).toHaveBeenCalledWith('New Status saved.');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('shows an error toast and does not close the dialog on failure', () => {
    const error = new Error('Server error');
    appointmentServiceMock.patchAppointmentStatus.mockReturnValue(throwError(() => error));
    component.f.status.setValue('Confirmed');
    component.save();
    expect(toastServiceMock.error).toHaveBeenCalledWith(error);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
