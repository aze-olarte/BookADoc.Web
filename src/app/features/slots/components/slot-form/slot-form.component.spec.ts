import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { addMinutes } from 'date-fns';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { toDateOnly, toDateTime, toTimeOnly } from '../../../../shared/utils/date-time.utils';
import { SlotService } from '../../services/slot.service';
import { SlotFormComponent } from './slot-form.component';

describe('SlotFormComponent', () => {
  let fixture: ComponentFixture<SlotFormComponent>;
  let component: SlotFormComponent;

  let dialogRef: { close: Mock };
  let toastService: { success: Mock };
  let slotService: { addSlot: Mock };

  const doctorId = 7;

  const futureDay = new Date(2099, 5, 15);
  const futureStart = new Date(2099, 5, 15, 9, 0, 0);

  const existingSlot: SlotResponse = {
    id: 21,
    date: '2099-06-15',
    startTime: '09:00:00',
    endTime: '10:00:00',
    isBooked: true,
    doctorProfileId: doctorId,
  };

  async function setup(data: { doctorId: number; event?: SlotResponse } = { doctorId }) {
    dialogRef = { close: vi.fn() };
    toastService = { success: vi.fn() };
    slotService = { addSlot: vi.fn().mockReturnValue(of(void 0)) };

    TestBed.overrideComponent(SlotFormComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [SlotFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: ToastService, useValue: toastService },
        { provide: SlotService, useValue: slotService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillAddForm() {
    component.f.date.setValue(futureDay);
    component.f.startTime.setValue(futureStart);
  }

  describe('add mode (no event)', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create and expose the dialog data', () => {
      expect(component).toBeTruthy();
      expect(component.data).toEqual({ doctorId });
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });

    it('should start with no start or end time', () => {
      expect(component.f.startTime.value).toBeNull();
      expect(component.f.endTime.value).toBeNull();
    });

    it('should start with the end time disabled (it is derived from the start time)', () => {
      expect(component.f.endTime.disabled).toBe(true);
    });

    it('should start invalid because no start time is chosen', () => {
      expect(component.f.startTime.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should expose minDate as a Date no later than now', () => {
      expect(component.minDate).toBeInstanceOf(Date);
      expect(component.minDate.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('end time follows the start time', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should set the end time 30 minutes after the start time', () => {
      component.f.startTime.setValue(futureStart);

      expect(component.f.endTime.value).toEqual(addMinutes(futureStart, 30));
    });

    it('should recalculate the end time when the start time changes', () => {
      component.f.startTime.setValue(futureStart);
      const later = new Date(2099, 5, 15, 14, 15, 0);

      component.f.startTime.setValue(later);

      expect(component.f.endTime.value).toEqual(addMinutes(later, 30));
    });

    it('should cross the hour boundary correctly', () => {
      component.f.startTime.setValue(new Date(2099, 5, 15, 9, 45, 0));

      expect(component.f.endTime.value).toEqual(new Date(2099, 5, 15, 10, 15, 0));
    });

    it('should keep the end time disabled after it is filled in', () => {
      component.f.startTime.setValue(futureStart);

      expect(component.f.endTime.disabled).toBe(true);
    });

    it('should leave the previous end time in place when the start time is cleared', () => {
      component.f.startTime.setValue(futureStart);

      component.f.startTime.setValue(null);

      expect(component.f.endTime.value).toEqual(addMinutes(futureStart, 30));
      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('validation', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should be valid with a future date and a start time', () => {
      fillAddForm();

      expect(component.fg.valid).toBe(true);
    });

    it('should require a date', () => {
      fillAddForm();

      component.f.date.setValue(null as unknown as Date);

      expect(component.f.date.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should reject a date in the past', () => {
      fillAddForm();

      component.f.date.setValue(new Date(2000, 0, 1));

      expect(component.f.date.invalid).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('edit mode (existing event)', () => {
    beforeEach(async () => {
      await setup({ doctorId, event: existingSlot });
    });

    it('should prefill the date from the event', () => {
      expect(component.f.date.value).toEqual(new Date('2099-06-15T00:00:00'));
    });

    it('should prefill the start time from the event', () => {
      expect(component.f.startTime.value).toEqual(
        toDateTime(existingSlot.date, existingSlot.startTime),
      );
    });

    it("should keep the event's own end time rather than the 30-minute default", () => {
      expect(component.f.endTime.value).toEqual(
        toDateTime(existingSlot.date, existingSlot.endTime),
      );
      expect(component.f.endTime.value).not.toEqual(
        addMinutes(toDateTime(existingSlot.date, existingSlot.startTime), 30),
      );
    });

    it('should be valid for a slot in the future', () => {
      expect(component.fg.valid).toBe(true);
    });
  });

  describe('edit mode with a slot in the past', () => {
    it('should make the form invalid', async () => {
      await setup({ doctorId, event: { ...existingSlot, date: '2000-01-03' } });

      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('save() with an invalid form', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should not call the API, toast or close the dialog', () => {
      component.save();

      expect(slotService.addSlot).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched so errors are shown', () => {
      expect(component.f.startTime.touched).toBe(false);

      component.save();

      expect(component.f.startTime.touched).toBe(true);
      expect(component.f.date.touched).toBe(true);
    });
  });

  describe('save() in add mode', () => {
    beforeEach(async () => {
      await setup();
      fillAddForm();
    });

    it('should create the slot for the doctor with id 0 and isBooked false', () => {
      component.save();

      const expectedEnd = addMinutes(futureStart, 30);
      expect(slotService.addSlot).toHaveBeenCalledTimes(1);
      expect(slotService.addSlot).toHaveBeenCalledWith(doctorId, {
        id: 0,
        date: toDateOnly(futureDay),
        startTime: toTimeOnly(futureStart),
        endTime: toTimeOnly(expectedEnd),
        isBooked: false,
      });
    });

    it('should show a success toast and close the dialog with true', () => {
      component.save();

      expect(toastService.success).toHaveBeenCalledWith('Slot saved.');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should neither toast nor close the dialog when the API call fails', () => {
      slotService.addSlot.mockReturnValue(throwError(() => new Error('Overlapping slot')));

      expect(() => component.save()).not.toThrow();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('save() in edit mode', () => {
    beforeEach(async () => {
      await setup({ doctorId, event: existingSlot });
    });

    it('should send the existing id, isBooked flag and the event end time', () => {
      component.save();

      expect(slotService.addSlot).toHaveBeenCalledWith(doctorId, {
        id: 21,
        date: toDateOnly(new Date('2099-06-15T00:00:00')),
        startTime: toTimeOnly(toDateTime(existingSlot.date, existingSlot.startTime)),
        endTime: toTimeOnly(toDateTime(existingSlot.date, existingSlot.endTime)),
        isBooked: true,
      });
    });

    it('should send the new end time (start + 30) after the start time is changed', () => {
      const newStart = new Date(2099, 5, 15, 11, 0, 0);
      component.f.startTime.setValue(newStart);

      component.save();

      expect(slotService.addSlot).toHaveBeenCalledWith(
        doctorId,
        expect.objectContaining({
          id: 21,
          startTime: toTimeOnly(newStart),
          endTime: toTimeOnly(addMinutes(newStart, 30)),
        }),
      );
    });

    it('should show a success toast and close the dialog with true', () => {
      component.save();

      expect(toastService.success).toHaveBeenCalledWith('Slot saved.');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
  });
});
