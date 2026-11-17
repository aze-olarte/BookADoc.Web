import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsNotesFormComponent } from './appointments-notes-form.component';

describe('AppointmentsNotesFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsNotesFormComponent>;
  let component: AppointmentsNotesFormComponent;

  let dialogRef: { close: Mock };
  let toastService: { success: Mock };
  let appointmentService: { addNotes: Mock };

  const baseData = {
    id: 42,
    status: 'status' as unknown as AppointmentStatus,
    role: 'role' as unknown as UserRole,
    notes: 'Existing notes',
  };

  async function setup(data = baseData) {
    dialogRef = { close: vi.fn() };
    toastService = { success: vi.fn() };
    appointmentService = { addNotes: vi.fn().mockReturnValue(of(void 0)) };

    await TestBed.configureTestingModule({
      imports: [AppointmentsNotesFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ToastService, useValue: toastService },
        { provide: AppointmentService, useValue: appointmentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsNotesFormComponent);
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
      expect(component.inputData).toEqual(baseData);
    });

    it('should prefill the notes control from the dialog data', () => {
      expect(component.f.notes.value).toBe('Existing notes');
    });

    it('should be valid when prefilled with existing notes', () => {
      expect(component.fg.valid).toBe(true);
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });
  });

  describe('when there are no existing notes', () => {
    beforeEach(async () => {
      await setup({ ...baseData, notes: '' });
    });

    it('should start with an empty, invalid form', () => {
      expect(component.f.notes.value).toBe('');
      expect(component.f.notes.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('validation', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should be invalid when notes are cleared', () => {
      component.f.notes.setValue('');

      expect(component.f.notes.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should become valid again once notes are entered', () => {
      component.f.notes.setValue('');
      component.f.notes.setValue('Patient reports improvement');

      expect(component.fg.valid).toBe(true);
    });

    it('should currently accept whitespace-only notes', () => {
      component.f.notes.setValue('   ');

      expect(component.fg.valid).toBe(true);
    });
  });

  describe('save()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should not call the API when the form is invalid', () => {
      component.f.notes.setValue('');

      component.save();

      expect(appointmentService.addNotes).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark controls as touched when the form is invalid', () => {
      component.f.notes.setValue('');
      expect(component.f.notes.touched).toBe(false);

      component.save();

      expect(component.f.notes.touched).toBe(true);
    });

    it('should submit the existing notes for the appointment id', () => {
      component.save();

      expect(appointmentService.addNotes).toHaveBeenCalledTimes(1);
      expect(appointmentService.addNotes).toHaveBeenCalledWith(42, { notes: 'Existing notes' });
    });

    it('should submit the updated notes', () => {
      component.f.notes.setValue('Follow-up in two weeks');

      component.save();

      expect(appointmentService.addNotes).toHaveBeenCalledWith(42, {
        notes: 'Follow-up in two weeks',
      });
    });

    it('should show a success toast and close the dialog with true on success', () => {
      component.save();

      expect(toastService.success).toHaveBeenCalledWith('Notes saved.');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should neither toast nor close the dialog when the API call fails', () => {
      appointmentService.addNotes.mockReturnValue(throwError(() => new Error('Server error')));

      expect(() => component.save()).not.toThrow();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
