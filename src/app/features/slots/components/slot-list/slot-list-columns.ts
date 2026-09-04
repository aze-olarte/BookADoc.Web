import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';

export const columns: Column<SlotResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: SlotResponse) => `${element.id}`,
  },
  {
    columnDef: 'date',
    header: 'Date',
    cell: (element: SlotResponse) => `${element.date}`,
  },
  {
    columnDef: 'startTime',
    header: 'Start Time',
    cell: (element: SlotResponse) => `${element.startTime}`,
  },
  {
    columnDef: 'endTime',
    header: 'End Time',
    cell: (element: SlotResponse) => `${element.endTime}`,
  },
  {
    columnDef: 'isBooked',
    header: 'Is Booked',
    cell: (element: SlotResponse) => `${element.isBooked}`,
  },
];
