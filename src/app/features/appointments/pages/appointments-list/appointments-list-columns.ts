import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { Column } from '../../../../core/models/columns';

export const columns: Column<AppointmentResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: AppointmentResponse) => `${element.id}`,
  },
  {
    columnDef: 'patientName',
    header: 'Patient',
    cell: (element: AppointmentResponse) => `${element.patientName}`,
  },
  {
    columnDef: 'doctorName',
    header: 'Doctor',
    cell: (element: AppointmentResponse) => `${element.doctorName}`,
  },
  {
    columnDef: 'specialization',
    header: 'Specialization',
    cell: (element: AppointmentResponse) => `${element.specialization}`,
  },
  {
    columnDef: 'date',
    header: 'Date',
    cell: (element: AppointmentResponse) => `${element.date}`,
  },
  {
    columnDef: 'startTime',
    header: 'Start Time',
    cell: (element: AppointmentResponse) => `${element.startTime}`,
  },
  {
    columnDef: 'endTime',
    header: 'End Time',
    cell: (element: AppointmentResponse) => `${element.endTime}`,
  },
  {
    columnDef: 'status',
    header: 'Status',
    cell: (element: AppointmentResponse) => `${element.status}`,
  },
];
