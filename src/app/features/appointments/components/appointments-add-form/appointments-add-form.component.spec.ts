import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ToastService } from '../../../../core/services/toast.service';
import { DoctorService } from '../../../doctors/services/doctor.service';
import { SlotService } from '../../../slots/services/slot.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsAddFormComponent } from './appointments-add-form.component';

describe('AppointmentsAddFormComponent', () => {
  let fixture: ComponentFixture<AppointmentsAddFormComponent>;
  let component: AppointmentsAddFormComponent;

  let dialogRef: { close: Mock };
  let toastService: { success: Mock };
  let appointmentService: { addAppointment: Mock };
  let specializationService: { getAll: Mock };
  let doctorService: { getAll: Mock };
  let slotService: { getSlots: Mock };

  const specializations = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Dermatology' },
  ];
  const doctors = [
    { id: 10, name: 'Dr. Reyes' },
    { id: 11, name: 'Dr. Santos' },
  ];
  const slots = [{ id: 7 }, { id: 8 }];

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    toastService = { success: vi.fn() };
    appointmentService = { addAppointment: vi.fn().mockReturnValue(of(void 0)) };
    specializationService = { getAll: vi.fn().mockReturnValue(of(specializations)) };
    doctorService = { getAll: vi.fn().mockReturnValue(of(doctors)) };
    slotService = { getSlots: vi.fn().mockReturnValue(of(slots)) };

    await TestBed.configureTestingModule({
      imports: [AppointmentsAddFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ToastService, useValue: toastService },
        { provide: AppointmentService, useValue: appointmentService },
        { provide: SpecializationService, useValue: specializationService },
        { provide: DoctorService, useValue: doctorService },
        { provide: SlotService, useValue: slotService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function selectSpecializationAndDoctor(specializationId = 1, doctorId = 10) {
    component.fg.controls.specialization.setValue(specializationId);
    component.fg.controls.doctor.setValue(doctorId);
  }

  function fillValidForm(slotIds: number[] = [7], reason = 'Regular checkup') {
    selectSpecializationAndDoctor();
    component.fg.controls.slotId.setValue(slotIds);
    component.fg.controls.reason.setValue(reason);
  }

  describe('initial state', () => {
    it('should load specialization options on creation', () => {
      expect(specializationService.getAll).toHaveBeenCalledTimes(1);
      expect(component.specializationOptions()).toEqual(specializations);
    });

    it('should start with the doctor control disabled', () => {
      expect(component.f.doctor.disabled).toBe(true);
    });

    it('should start with no doctor or slot options and not fetch them', () => {
      expect(component.doctorOptions()).toEqual([]);
      expect(component.slotOptions()).toEqual([]);
      expect(doctorService.getAll).not.toHaveBeenCalled();
      expect(slotService.getSlots).not.toHaveBeenCalled();
    });

    it('should start with an invalid form', () => {
      expect(component.fg.invalid).toBe(true);
    });

    it('should default reason to an empty string and slotId to an empty array', () => {
      expect(component.f.reason.value).toBe('');
      expect(component.f.slotId.value).toEqual([]);
    });

    it('should expose minDate as a Date no later than now', () => {
      expect(component.minDate).toBeInstanceOf(Date);
      expect(component.minDate.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });
  });

  describe('specialization selection', () => {
    it('should fetch doctors for the selected specialization', () => {
      component.fg.controls.specialization.setValue(1);

      expect(doctorService.getAll).toHaveBeenCalledWith(1);
      expect(component.doctorOptions()).toEqual(doctors);
    });

    it('should enable the doctor control', () => {
      component.fg.controls.specialization.setValue(1);

      expect(component.f.doctor.enabled).toBe(true);
    });

    it('should refetch doctors when the specialization changes', () => {
      component.fg.controls.specialization.setValue(1);
      component.fg.controls.specialization.setValue(2);

      expect(doctorService.getAll).toHaveBeenCalledTimes(2);
      expect(doctorService.getAll).toHaveBeenLastCalledWith(2);
    });

    it('should disable the doctor control when the specialization is cleared', () => {
      component.fg.controls.specialization.setValue(1);
      component.fg.controls.specialization.setValue(null);

      expect(component.f.doctor.disabled).toBe(true);
    });

    it('should not fetch doctors when the specialization is cleared', () => {
      component.fg.controls.specialization.setValue(1);
      doctorService.getAll.mockClear();

      component.fg.controls.specialization.setValue(null);

      expect(doctorService.getAll).not.toHaveBeenCalled();
    });

    it('should require a doctor once the specialization is chosen', () => {
      component.fg.controls.specialization.setValue(1);

      expect(component.f.doctor.hasError('required')).toBe(true);
    });
  });

  describe('doctor selection', () => {
    it('should enable the date control', () => {
      selectSpecializationAndDoctor();

      expect(component.f.date.enabled).toBe(true);
    });

    it('should disable the date control when the doctor is cleared', () => {
      selectSpecializationAndDoctor();
      component.fg.controls.doctor.setValue(null);

      expect(component.f.date.disabled).toBe(true);
    });

    it('should fetch slots for the selected doctor and date', () => {
      selectSpecializationAndDoctor(1, 10);

      const date = component.f.date.value;
      expect(slotService.getSlots).toHaveBeenCalledWith(10, date, date);
      expect(component.slotOptions()).toEqual(slots);
    });

    it('should refetch slots when a different doctor is selected', () => {
      selectSpecializationAndDoctor(1, 10);
      component.fg.controls.doctor.setValue(11);

      const date = component.f.date.value;
      expect(slotService.getSlots).toHaveBeenLastCalledWith(11, date, date);
    });

    it('should refetch slots when the date changes', () => {
      selectSpecializationAndDoctor(1, 10);
      slotService.getSlots.mockClear();

      const newDate = new Date(2030, 0, 15);
      component.fg.controls.date.setValue(newDate);

      expect(slotService.getSlots).toHaveBeenCalledWith(10, newDate, newDate);
    });

    it('should not refetch slots when only unrelated fields change', () => {
      selectSpecializationAndDoctor(1, 10);
      slotService.getSlots.mockClear();

      component.fg.controls.reason.setValue('Back pain');
      component.fg.controls.slotId.setValue([7]);

      expect(slotService.getSlots).not.toHaveBeenCalled();
    });

    it('should not fetch slots before a doctor is selected', () => {
      component.fg.controls.specialization.setValue(1);
      component.fg.controls.reason.setValue('Back pain');

      expect(slotService.getSlots).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should be valid when every required field is filled', () => {
      fillValidForm();

      expect(component.fg.valid).toBe(true);
    });

    it('should be invalid when no slot is selected', () => {
      fillValidForm([]);

      expect(component.f.slotId.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should treat reason as optional', () => {
      fillValidForm([7], '');

      expect(component.f.reason.valid).toBe(true);
      expect(component.fg.valid).toBe(true);
    });

    it('should still reject past dates after a doctor is selected', () => {
      selectSpecializationAndDoctor();

      component.fg.controls.date.setValue(new Date(2000, 0, 1));

      expect(component.f.date.invalid).toBe(true);
    });
  });

  describe('save()', () => {
    it('should not call the API when the form is invalid', () => {
      component.save();

      expect(appointmentService.addAppointment).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched when the form is invalid', () => {
      expect(component.fg.touched).toBe(false);

      component.save();

      expect(component.f.specialization.touched).toBe(true);
      expect(component.f.slotId.touched).toBe(true);
      expect(component.f.reason.touched).toBe(true);
    });

    it('should submit the first selected slot and the reason', () => {
      fillValidForm([7], 'Regular checkup');

      component.save();

      expect(appointmentService.addAppointment).toHaveBeenCalledTimes(1);
      expect(appointmentService.addAppointment).toHaveBeenCalledWith({
        slotId: 7,
        reason: 'Regular checkup',
      });
    });

    it('should only submit the first slot when several are selected', () => {
      fillValidForm([8, 7], 'Follow-up');

      component.save();

      expect(appointmentService.addAppointment).toHaveBeenCalledWith({
        slotId: 8,
        reason: 'Follow-up',
      });
    });

    it('should show a success toast and close the dialog with true on success', () => {
      fillValidForm();

      component.save();

      expect(toastService.success).toHaveBeenCalledWith('Appointment saved.');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should neither toast nor close the dialog when the API call fails', () => {
      appointmentService.addAppointment.mockReturnValue(
        throwError(() => new Error('Slot already booked')),
      );
      fillValidForm();

      expect(() => component.save()).not.toThrow();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
