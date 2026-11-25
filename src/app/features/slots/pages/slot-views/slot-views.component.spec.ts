import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../auth/services/auth.service';
import { SlotCalendarComponent } from '../../components/slot-calendar/slot-calendar.component';
import { SlotFormComponent } from '../../components/slot-form/slot-form.component';
import { SlotListComponent } from '../../components/slot-list/slot-list.component';
import { SlotService } from '../../services/slot.service';
import { SlotViewsComponent } from './slot-views.component';

type TestUser = { doctorProfileId: number } | null;

describe('SlotViewsComponent', () => {
  let component: SlotViewsComponent;

  let dialog: { open: Mock };
  let authService: { user: ReturnType<typeof signal<TestUser>> };
  let slotService: { deleteSlot: Mock };
  let toastService: { success: Mock };

  const doctorId = 12;

  const slot: SlotResponse = {
    id: 5,
    date: '2026-11-25',
    startTime: '09:00:00',
    endTime: '09:30:00',
    isBooked: false,
    doctorProfileId: doctorId,
  };

  async function setup(user: TestUser = { doctorProfileId: doctorId }) {
    dialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };
    authService = { user: signal<TestUser>(user) };
    slotService = { deleteSlot: vi.fn().mockReturnValue(of(void 0)) };
    toastService = { success: vi.fn() };

    TestBed.overrideComponent(SlotViewsComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [SlotViewsComponent],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: AuthService, useValue: authService },
        { provide: SlotService, useValue: slotService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SlotViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function closeDialogWith(result: boolean | undefined) {
    dialog.open.mockReturnValue({ afterClosed: () => of(result) });
  }

  function attachChildren() {
    const slotList = { loadData: vi.fn() };
    const slotCalendar = {
      loadData: vi.fn(),
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
    };
    component.slotList = slotList as unknown as SlotListComponent;
    component.slotCalendar = slotCalendar as unknown as SlotCalendarComponent;
    return { slotList, slotCalendar };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start on the list view', () => {
      expect(component.currentView()).toBe('list');
    });

    it('should take the doctor id from the signed-in user on init', () => {
      expect(component.doctorId()).toBe(doctorId);
    });
  });

  describe('without a signed-in user', () => {
    it('should throw on init because the user is read without a null check', async () => {
      await expect(setup(null)).rejects.toThrow();
    });
  });

  describe('onViewChange()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should switch to the calendar view', () => {
      component.onViewChange({ value: 'calendar' } as MatButtonToggleChange);

      expect(component.currentView()).toBe('calendar');
    });

    it('should switch back to the list view', () => {
      component.onViewChange({ value: 'calendar' } as MatButtonToggleChange);
      component.onViewChange({ value: 'list' } as MatButtonToggleChange);

      expect(component.currentView()).toBe('list');
    });
  });

  describe('reloadData()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should reload the list when the list view is active', () => {
      const { slotList, slotCalendar } = attachChildren();

      component.reloadData();

      expect(slotList.loadData).toHaveBeenCalledTimes(1);
      expect(slotCalendar.loadData).not.toHaveBeenCalled();
    });

    it('should reload the calendar with its current date range when the calendar view is active', () => {
      const { slotList, slotCalendar } = attachChildren();
      component.currentView.set('calendar');

      component.reloadData();

      expect(slotCalendar.loadData).toHaveBeenCalledTimes(1);
      expect(slotCalendar.loadData).toHaveBeenCalledWith(
        slotCalendar.startDate,
        slotCalendar.endDate,
      );
      expect(slotList.loadData).not.toHaveBeenCalled();
    });

    it('should do nothing when the list view is active but the list is not rendered', () => {
      expect(() => component.reloadData()).not.toThrow();
    });

    it('should do nothing when the calendar view is active but the calendar is not rendered', () => {
      component.currentView.set('calendar');

      expect(() => component.reloadData()).not.toThrow();
    });
  });

  describe('onUpdate()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should open the slot form with the doctor id and the slot to edit', () => {
      component.onUpdate(slot);

      expect(dialog.open).toHaveBeenCalledWith(SlotFormComponent, {
        disableClose: true,
        data: { doctorId, event: slot },
      });
    });

    it('should open the slot form without an event when creating a new slot', () => {
      component.onUpdate();

      expect(dialog.open).toHaveBeenCalledWith(SlotFormComponent, {
        disableClose: true,
        data: { doctorId, event: undefined },
      });
    });

    it('should reload the data when the dialog is confirmed', () => {
      closeDialogWith(true);
      const reload = vi.spyOn(component, 'reloadData').mockImplementation(() => {});

      component.onUpdate(slot);

      expect(reload).toHaveBeenCalledTimes(1);
    });

    it.each([false, undefined])(
      'should not reload the data when the dialog closes with %s',
      (result) => {
        closeDialogWith(result);
        const reload = vi.spyOn(component, 'reloadData').mockImplementation(() => {});

        component.onUpdate(slot);

        expect(reload).not.toHaveBeenCalled();
      },
    );
  });

  describe('onDelete()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should ask for confirmation before deleting', () => {
      component.onDelete(slot);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          title: 'Delete Slot',
          message: 'Are you sure you want to delete this slot?',
          confirmLabel: 'Delete',
        },
      });
    });

    it.each([false, undefined])(
      'should not delete anything when the dialog closes with %s',
      (result) => {
        closeDialogWith(result);
        const reload = vi.spyOn(component, 'reloadData').mockImplementation(() => {});

        component.onDelete(slot);

        expect(slotService.deleteSlot).not.toHaveBeenCalled();
        expect(toastService.success).not.toHaveBeenCalled();
        expect(reload).not.toHaveBeenCalled();
      },
    );

    it('should delete the slot of this doctor when confirmed', () => {
      closeDialogWith(true);

      component.onDelete(slot);

      expect(slotService.deleteSlot).toHaveBeenCalledTimes(1);
      expect(slotService.deleteSlot).toHaveBeenCalledWith(doctorId, 5);
    });

    it('should show a toast and reload the data after a successful delete', () => {
      closeDialogWith(true);
      const reload = vi.spyOn(component, 'reloadData').mockImplementation(() => {});

      component.onDelete(slot);

      expect(toastService.success).toHaveBeenCalledWith('Slot deleted');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('should neither toast nor reload when the delete fails', () => {
      closeDialogWith(true);
      slotService.deleteSlot.mockReturnValue(throwError(() => new Error('Slot is booked')));
      const reload = vi.spyOn(component, 'reloadData').mockImplementation(() => {});

      expect(() => component.onDelete(slot)).not.toThrow();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
