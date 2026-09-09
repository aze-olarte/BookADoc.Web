import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';

export const columns: Column<SlotResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: SlotResponse) => `${element.id}`,
    type: 'number',
  },
  {
    columnDef: 'date',
    header: 'Date',
    cell: (element: SlotResponse) => `${element.date}`,
    type: 'date',
  },
  {
    columnDef: 'startTime',
    header: 'Start Time',
    cell: (element: SlotResponse) => `${element.startTime}`,
    type: 'time',
  },
  {
    columnDef: 'endTime',
    header: 'End Time',
    cell: (element: SlotResponse) => `${element.endTime}`,
    type: 'time',
  },
  {
    columnDef: 'isBooked',
    header: 'Is Booked',
    cell: (element: SlotResponse) => `${element.isBooked}`,
    type: 'boolean',
  },
];
