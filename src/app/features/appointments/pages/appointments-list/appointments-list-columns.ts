import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { Column } from '../../../../core/models/columns';

export const columns: Column<AppointmentResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: AppointmentResponse) => `${element.id}`,
    type: 'number',
  },
  {
    columnDef: 'patientName',
    header: 'Patient',
    cell: (element: AppointmentResponse) => `${element.patientName}`,
    type: 'text',
  },
  {
    columnDef: 'doctorName',
    header: 'Doctor',
    cell: (element: AppointmentResponse) => `${element.doctorName}`,
    type: 'text',
  },
  {
    columnDef: 'specialization',
    header: 'Specialization',
    cell: (element: AppointmentResponse) => `${element.specialization}`,
    type: 'text',
  },
  {
    columnDef: 'date',
    header: 'Date',
    cell: (element: AppointmentResponse) => `${element.date}`,
    type: 'date',
  },
  {
    columnDef: 'startTime',
    header: 'Start Time',
    cell: (element: AppointmentResponse) => `${element.startTime}`,
    type: 'time',
  },
  {
    columnDef: 'endTime',
    header: 'End Time',
    cell: (element: AppointmentResponse) => `${element.endTime}`,
    type: 'time',
  },
  {
    columnDef: 'status',
    header: 'Status',
    cell: (element: AppointmentResponse) => `${element.status}`,
    type: 'text',
  },
];
