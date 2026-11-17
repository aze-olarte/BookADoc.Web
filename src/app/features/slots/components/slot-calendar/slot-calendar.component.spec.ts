import type { DatesSetArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { SlotService } from '../../services/slot.service';
import { SlotCalendarComponent } from './slot-calendar.component';

describe('SlotCalendarComponent', () => {
  let fixture: ComponentFixture<SlotCalendarComponent>;
  let component: SlotCalendarComponent;
  let slotService: { getSlots: Mock };

  const doctorId = 7;

  const availableSlot: SlotResponse = {
    id: 1,
    date: '2026-11-18',
    startTime: '09:00:00',
    endTime: '09:30:00',
    isBooked: false,
    doctorProfileId: doctorId,
  };
  const bookedSlot: SlotResponse = {
    id: 2,
    date: '2026-11-18',
    startTime: '10:00:00',
    endTime: '10:30:00',
    isBooked: true,
    doctorProfileId: doctorId,
  };

  async function setup(
    slots: SlotResponse[] = [availableSlot, bookedSlot],
    source$?: Observable<SlotResponse[]>,
  ) {
    slotService = { getSlots: vi.fn().mockReturnValue(source$ ?? of(slots)) };

    TestBed.overrideComponent(SlotCalendarComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [SlotCalendarComponent],
      providers: [{ provide: SlotService, useValue: slotService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotCalendarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', doctorId);
    fixture.detectChanges();
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

    it('should load the slots for the current week on init', async () => {
      // Wednesday 18 Nov 2026, midday (local time). Weeks start on Sunday by default.
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 10, 18, 12, 0, 0));

      await setup();

      expect(slotService.getSlots).toHaveBeenCalledTimes(1);
      expect(slotService.getSlots).toHaveBeenCalledWith(
        doctorId,
        new Date(2026, 10, 15, 0, 0, 0, 0), // Sunday 00:00
        new Date(2026, 10, 21, 23, 59, 59, 999), // Saturday 23:59:59.999
      );
    });

    it('should keep the events empty while the request is pending', async () => {
      await setup([], new Subject<SlotResponse[]>());

      expect(component.events()).toEqual([]);
    });
  });

  describe('loadData()', () => {
    it('should convert slots into calendar events', async () => {
      await setup([availableSlot, bookedSlot]);

      expect(component.events()).toEqual([
        {
          id: '1',
          start: '2026-11-18T09:00:00',
          end: '2026-11-18T09:30:00',
          allDay: false,
          title: 'Available',
          classNames: ['slot-available'],
          data: availableSlot,
        },
        {
          id: '2',
          start: '2026-11-18T10:00:00',
          end: '2026-11-18T10:30:00',
          allDay: false,
          title: 'Booked',
          classNames: ['slot-booked'],
          data: bookedSlot,
        },
      ]);
    });

    it('should produce no events when there are no slots', async () => {
      await setup([]);

      expect(component.events()).toEqual([]);
    });

    it('should request the given range and the current doctor', async () => {
      await setup();
      const start = new Date(2026, 11, 1);
      const end = new Date(2026, 11, 8);

      component.loadData(start, end);

      expect(slotService.getSlots).toHaveBeenLastCalledWith(doctorId, start, end);
    });

    it('should replace the previous events rather than append', async () => {
      await setup([availableSlot, bookedSlot]);
      slotService.getSlots.mockReturnValue(of([bookedSlot]));

      component.loadData(new Date(2026, 11, 1), new Date(2026, 11, 8));

      expect(component.events().map((e) => e.id)).toEqual(['2']);
    });

    it('should keep the existing events and not throw when the request fails', async () => {
      await setup([availableSlot]);
      slotService.getSlots.mockReturnValue(throwError(() => new Error('boom')));

      expect(() => component.loadData()).not.toThrow();

      expect(component.events().map((e) => e.id)).toEqual(['1']);
    });
  });

  describe('datesSet callback (navigating weeks)', () => {
    it('should load the slots for the visible range', async () => {
      await setup();
      const start = new Date(2026, 10, 22);
      const end = new Date(2026, 10, 29);

      component.calendarOptions.datesSet?.({ start, end } as DatesSetArg);

      expect(slotService.getSlots).toHaveBeenLastCalledWith(doctorId, start, end);
    });

    it('should update the events for the newly visible range', async () => {
      await setup([availableSlot]);
      slotService.getSlots.mockReturnValue(of([bookedSlot]));

      component.calendarOptions.datesSet?.({
        start: new Date(2026, 10, 22),
        end: new Date(2026, 10, 29),
      } as DatesSetArg);

      expect(component.events().map((e) => e.id)).toEqual(['2']);
    });
  });

  describe('dateClick callback (clicking an empty cell)', () => {
    it('should emit a new unbooked 30-minute slot starting at the clicked time', async () => {
      await setup();
      const emitted: SlotResponse[] = [];
      component.emitClick.subscribe((slot) => emitted.push(slot));

      component.calendarOptions.dateClick?.({ dateStr: '2026-11-18T09:30:00' } as DateClickArg);

      expect(emitted).toEqual([
        {
          id: 0,
          date: '2026-11-18',
          startTime: '09:30:00',
          endTime: '10:00:00',
          isBooked: false,
          doctorProfileId: doctorId,
        },
      ]);
    });

    it('should roll the end time over the hour correctly', async () => {
      await setup();
      const emitted: SlotResponse[] = [];
      component.emitClick.subscribe((slot) => emitted.push(slot));

      component.calendarOptions.dateClick?.({ dateStr: '2026-11-18T08:45:00' } as DateClickArg);

      expect(emitted[0].startTime).toBe('08:45:00');
      expect(emitted[0].endTime).toBe('09:15:00');
    });

    it('should use the current doctor id at click time', async () => {
      await setup();
      const emitted: SlotResponse[] = [];
      component.emitClick.subscribe((slot) => emitted.push(slot));
      fixture.componentRef.setInput('id', 99);

      component.calendarOptions.dateClick?.({ dateStr: '2026-11-18T09:30:00' } as DateClickArg);

      expect(emitted[0].doctorProfileId).toBe(99);
    });

    it('should not reload the slots by itself', async () => {
      await setup();
      slotService.getSlots.mockClear();

      component.calendarOptions.dateClick?.({ dateStr: '2026-11-18T09:30:00' } as DateClickArg);

      expect(slotService.getSlots).not.toHaveBeenCalled();
    });
  });

  describe('calendar configuration', () => {
    it('should show a read-only week time grid', async () => {
      await setup();

      expect(component.calendarOptions.initialView).toBe('timeGridWeek');
      expect(component.calendarOptions.selectable).toBe(false);
      expect(component.calendarOptions.editable).toBe(false);
      expect(component.calendarOptions.allDaySlot).toBe(false);
    });

    it('should cover 7:00 to 23:00 in 30-minute slots', async () => {
      await setup();

      expect(component.calendarOptions.slotMinTime).toBe('07:00:00');
      expect(component.calendarOptions.slotMaxTime).toBe('23:00:00');
      expect(component.calendarOptions.slotDuration).toBe('00:30:00');
    });

    it('should register the time grid and interaction plugins', async () => {
      await setup();

      expect(component.calendarOptions.plugins).toHaveLength(2);
    });

    it('should have handlers for date clicks and range changes', async () => {
      await setup();

      expect(component.calendarOptions.dateClick).toBeTypeOf('function');
      expect(component.calendarOptions.datesSet).toBeTypeOf('function');
    });
  });
});
