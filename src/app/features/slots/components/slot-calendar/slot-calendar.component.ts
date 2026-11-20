import { Component, inject, input, OnInit, output, signal, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventInput } from '@fullcalendar/core/index.js';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { addMinutes, endOfWeek, format, parseISO, startOfWeek } from 'date-fns';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { SlotService } from '../../services/slot.service';

@Component({
  selector: 'app-slot-calendar',
  imports: [FullCalendarModule],
  templateUrl: './slot-calendar.component.html',
  styleUrl: './slot-calendar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SlotCalendarComponent implements OnInit {
  private slotService = inject(SlotService);
  events = signal<EventInput[]>([]);
  id = input.required<number>();
  emitClick = output<SlotResponse>();
  startDate = startOfWeek(new Date());
  endDate = endOfWeek(new Date());

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    allDaySlot: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    selectable: false,
    editable: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: true },
    displayEventTime: false,
    height: 'auto',
    nowIndicator: true,
    dayHeaderFormat: { weekday: 'short', day: 'numeric' },
    events: this.events(),
    dateClick: (arg: DateClickArg) => {
      const start = parseISO(arg.dateStr);
      const end = addMinutes(start, 30);

      const date = format(start, 'yyyy-MM-dd');
      const startTime = format(start, 'HH:mm:ss');
      const endTime = format(end, 'HH:mm:ss');
      const data: SlotResponse = {
        id: 0,
        date,
        startTime,
        endTime,
        isBooked: false,
        doctorProfileId: this.id(),
      };
      this.emitClick.emit(data);
    },

    datesSet: (arg: DatesSetArg) => {
      this.startDate = arg.start;
      this.endDate = arg.end;
      this.loadData(arg.start, arg.end);
    },
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(startDate: Date = this.startDate, endDate: Date = this.endDate): void {
    this.slotService.getSlots(this.id(), startDate, endDate).subscribe({
      next: (data) => {
        const eventData = data.map((item) => ({
          id: String(item.id),
          start: `${item.date}T${item.startTime}`,
          end: `${item.date}T${item.endTime}`,
          allDay: false,
          title: item.isBooked ? 'Booked' : 'Available',
          classNames: [item.isBooked ? 'slot-booked' : 'slot-available'],
          data: item,
        }));
        this.events.set(eventData);
      },
      error: () => {},
    });
  }
}
