import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsStatusFormComponent } from './appointments-status-form.component';

describe('AppointmentsStatusFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsStatusFormComponent>;
  let component: AppointmentsStatusFormComponent;

  let dialogRef: { close: Mock };
  let toastService: { success: Mock };
  let appointmentService: { getStatusDropdownOptions: Mock; patchAppointmentStatus: Mock };

  const inputData = {
    id: 42,
    status: 'current-status' as AppointmentStatus,
    role: 'some-role' as UserRole,
  };
  const statusOptions = ['Confirmed', 'Cancelled', 'Completed'];

  async function setup(options: string[] = statusOptions, data = inputData) {
    dialogRef = { close: vi.fn() };
    toastService = { success: vi.fn() };
    appointmentService = {
      getStatusDropdownOptions: vi.fn().mockReturnValue(options),
      patchAppointmentStatus: vi.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentsStatusFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ToastService, useValue: toastService },
        { provide: AppointmentService, useValue: appointmentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('initial state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should expose the injected dialog data', () => {
      expect(component.inputData).toEqual(inputData);
    });

    it('should ask the service for dropdown options using the role and current status', () => {
      expect(appointmentService.getStatusDropdownOptions).toHaveBeenCalledTimes(1);
      expect(appointmentService.getStatusDropdownOptions).toHaveBeenCalledWith(
        inputData.role,
        inputData.status,
      );
    });

    it('should populate the dropdown options signal from the service', () => {
      expect(component.dropdownOptions()).toEqual(statusOptions);
    });

    it('should start with an empty, invalid status control', () => {
      expect(component.f.status.value).toBe('');
      expect(component.f.status.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });
  });

  describe('when no status transitions are available', () => {
    beforeEach(async () => {
      await setup([]);
    });

    it('should have an empty options list', () => {
      expect(component.dropdownOptions()).toEqual([]);
    });

    it('should not be savable', () => {
      component.save();

      expect(appointmentService.patchAppointmentStatus).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should become valid once a status is selected', () => {
      component.f.status.setValue('Confirmed');

      expect(component.fg.valid).toBe(true);
    });

    it('should become invalid again when the status is cleared', () => {
      component.f.status.setValue('Confirmed');
      component.f.status.setValue('');

      expect(component.f.status.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('save()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should not call the API when no status is selected', () => {
      component.save();

      expect(appointmentService.patchAppointmentStatus).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark controls as touched when the form is invalid', () => {
      expect(component.f.status.touched).toBe(false);

      component.save();

      expect(component.f.status.touched).toBe(true);
    });

    it('should patch the appointment with the selected status', () => {
      component.f.status.setValue('Cancelled');

      component.save();

      expect(appointmentService.patchAppointmentStatus).toHaveBeenCalledTimes(1);
      expect(appointmentService.patchAppointmentStatus).toHaveBeenCalledWith(42, {
        status: 'Cancelled',
      });
    });

    it('should show a success toast and close the dialog with true on success', () => {
      component.f.status.setValue('Confirmed');

      component.save();

      expect(toastService.success).toHaveBeenCalledWith('New Status saved.');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should neither toast nor close the dialog when the API call fails', () => {
      appointmentService.patchAppointmentStatus.mockReturnValue(
        throwError(() => new Error('Server error')),
      );
      component.f.status.setValue('Confirmed');

      expect(() => component.save()).not.toThrow();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
