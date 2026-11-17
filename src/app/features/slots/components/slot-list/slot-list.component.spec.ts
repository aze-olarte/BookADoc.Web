import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { SlotService } from '../../services/slot.service';
import { SlotListComponent } from './slot-list.component';
import { columns } from './slot-list-columns';

describe('SlotListComponent', () => {
  let fixture: ComponentFixture<SlotListComponent>;
  let component: SlotListComponent;
  let slotService: { getSlots: Mock };

  const doctorId = 7;

  const makeSlot = (overrides: Partial<SlotResponse> = {}): SlotResponse => ({
    id: 1,
    date: '2026-11-25',
    startTime: '09:00:00',
    endTime: '09:30:00',
    isBooked: false,
    doctorProfileId: doctorId,
    ...overrides,
  });

  const slots = [makeSlot({ id: 1 }), makeSlot({ id: 2, isBooked: true })];

  async function setup(response: SlotResponse[] = slots) {
    slotService = { getSlots: vi.fn().mockReturnValue(of(response)) };

    TestBed.overrideComponent(SlotListComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [SlotListComponent],
      providers: [{ provide: SlotService, useValue: slotService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', doctorId);
    fixture.detectChanges();
  }

  function findAction(type: string) {
    return component.actions.find((a) => a.type === type);
  }

  function pinToday() {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 18, 12, 0, 0));
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should create', async () => {
      await setup();

      expect(component).toBeTruthy();
    });

    it("should load the doctor's slots on init", async () => {
      await setup();

      expect(slotService.getSlots).toHaveBeenCalledTimes(1);
      expect(slotService.getSlots).toHaveBeenCalledWith(doctorId);
      expect(component.data()).toEqual(slots);
    });

    it('should expose the shared column definitions', async () => {
      await setup();

      expect(component.columnDefs).toBe(columns);
    });

    it('should define update and delete actions', async () => {
      await setup();

      expect(component.actions.map((a) => a.type)).toEqual(['update', 'delete']);
    });
  });

  describe('loadData()', () => {
    it('should replace the data with the latest response', async () => {
      await setup();
      const fresh = [makeSlot({ id: 99 })];
      slotService.getSlots.mockReturnValue(of(fresh));

      component.loadData();

      expect(component.data()).toEqual(fresh);
    });

    it('should keep the existing data and not throw when the request fails', async () => {
      await setup();
      slotService.getSlots.mockReturnValue(throwError(() => new Error('boom')));

      expect(() => component.loadData()).not.toThrow();

      expect(component.data()).toEqual(slots);
    });

    it('should start empty when the doctor has no slots', async () => {
      await setup([]);

      expect(component.data()).toEqual([]);
    });
  });

  describe('outputs', () => {
    it('update(row) should emit the row to edit', async () => {
      await setup();
      const emitted: (SlotResponse | undefined)[] = [];
      component.emitUpdate.subscribe((v) => emitted.push(v));
      const row = makeSlot({ id: 5 });

      component.update(row);

      expect(emitted).toEqual([row]);
    });

    it('update() without a row should emit undefined (create a new slot)', async () => {
      await setup();
      const emitted: (SlotResponse | undefined)[] = [];
      component.emitUpdate.subscribe((v) => emitted.push(v));

      component.update();

      expect(emitted).toEqual([undefined]);
    });

    it('delete(row) should emit the row to delete', async () => {
      await setup();
      const emitted: SlotResponse[] = [];
      component.emitDelete.subscribe((v) => emitted.push(v));
      const row = makeSlot({ id: 5 });

      component.delete(row);

      expect(emitted).toEqual([row]);
    });
  });

  describe('onActionTriggered()', () => {
    it('should route "update" to update with the row', async () => {
      await setup();
      const spy = vi.spyOn(component, 'update').mockImplementation(() => {});
      const row = makeSlot({ id: 5 });

      component.onActionTriggered({ action: 'update', row });

      expect(spy).toHaveBeenCalledWith(row);
    });

    it('should route "delete" to delete with the row', async () => {
      await setup();
      const spy = vi.spyOn(component, 'delete').mockImplementation(() => {});
      const row = makeSlot({ id: 5 });

      component.onActionTriggered({ action: 'delete', row });

      expect(spy).toHaveBeenCalledWith(row);
    });

    it('should do nothing for an unknown action', async () => {
      await setup();
      const update = vi.spyOn(component, 'update').mockImplementation(() => {});
      const del = vi.spyOn(component, 'delete').mockImplementation(() => {});

      component.onActionTriggered({ action: 'view', row: makeSlot() });

      expect(update).not.toHaveBeenCalled();
      expect(del).not.toHaveBeenCalled();
    });
  });

  describe('delete action visibility', () => {
    it('should be shown for an unbooked slot', async () => {
      await setup();

      expect(findAction('delete')?.visible?.(makeSlot({ isBooked: false }))).toBe(true);
    });

    it('should be hidden for a booked slot', async () => {
      await setup();

      expect(findAction('delete')?.visible?.(makeSlot({ isBooked: true }))).toBe(false);
    });

    it('should not depend on the date (past unbooked slots can still be deleted)', async () => {
      await setup();
      pinToday();

      expect(
        findAction('delete')?.visible?.(makeSlot({ isBooked: false, date: '2026-01-05' })),
      ).toBe(true);
    });
  });

  describe('edit action visibility', () => {
    it('should be shown for an unbooked slot in the future', async () => {
      await setup();
      pinToday();

      expect(
        findAction('update')?.visible?.(makeSlot({ isBooked: false, date: '2026-11-25' })),
      ).toBe(true);
    });

    it.skipIf(new Date(2026, 10, 18).getTimezoneOffset() > 0)(
      'should be shown for an unbooked slot today',
      async () => {
        await setup();
        pinToday();

        expect(
          findAction('update')?.visible?.(makeSlot({ isBooked: false, date: '2026-11-18' })),
        ).toBe(true);
      },
    );

    it('should be hidden for an unbooked slot in the past', async () => {
      await setup();
      pinToday();

      expect(
        findAction('update')?.visible?.(makeSlot({ isBooked: false, date: '2026-11-10' })),
      ).toBe(false);
    });

    it('should be hidden for a booked slot, even in the future', async () => {
      await setup();
      pinToday();

      expect(
        findAction('update')?.visible?.(makeSlot({ isBooked: true, date: '2026-11-25' })),
      ).toBe(false);
    });

    it('should be hidden for a booked slot in the past', async () => {
      await setup();
      pinToday();

      expect(
        findAction('update')?.visible?.(makeSlot({ isBooked: true, date: '2026-11-10' })),
      ).toBe(false);
    });
  });
});
