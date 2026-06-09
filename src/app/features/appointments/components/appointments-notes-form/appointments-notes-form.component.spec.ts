import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsNotesFormComponent } from './appointments-notes-form.component';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { UserRole } from '../../../../core/models/user-role.enum';

describe('AppointmentsNotesFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsNotesFormComponent>;
  let component: AppointmentsNotesFormComponent;
  let appointmentServiceMock = { addNotes: vi.fn() };
  let toastServiceMock = { success: vi.fn(), error: vi.fn() };
  let dialogRefMock = { close: vi.fn() };
  const mockInputData = { id: 1, status: AppointmentStatus.Pending, role: UserRole.Doctor };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppointmentsNotesFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: mockInputData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsNotesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initialises with an empty invalid form', () => {
    expect(component.f.notes.value).toBe('');
    expect(component.fg.invalid).toBe(true);
  });

  it('marks all controls as touched and does not call the service when the form is invalid', () => {
    component.save();
    expect(component.f.notes.touched).toBe(true);
    expect(appointmentServiceMock.addNotes).not.toHaveBeenCalled();
  });

  it('calls the service with the form value and the dialog data id when the form is valid', () => {
    appointmentServiceMock.addNotes.mockReturnValue(of(void 0));
    component.f.notes.setValue('Patient is recovering well.');
    component.save();
    expect(appointmentServiceMock.addNotes).toHaveBeenCalledWith(mockInputData.id, {
      notes: 'Patient is recovering well.',
    });
  });

  it('shows a success toast and closes the dialog on success', () => {
    appointmentServiceMock.addNotes.mockReturnValue(of(void 0));
    component.f.notes.setValue('Patient is recovering well.');
    component.save();
    expect(toastServiceMock.success).toHaveBeenCalledWith('Notes saved.');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('shows an error toast and does not close the dialog on failure', () => {
    const error = new Error('Server error');
    appointmentServiceMock.addNotes.mockReturnValue(throwError(() => error));
    component.f.notes.setValue('Patient is recovering well.');
    component.save();
    expect(toastServiceMock.error).toHaveBeenCalledWith(error);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
