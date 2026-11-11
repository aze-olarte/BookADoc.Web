import { Column } from '../../../../core/models/columns';
import { DoctorPatientResponse } from '../../../../core/models/doctor-patient-response.model';
import { PatientResponse } from '../../../../core/models/patient-response.model';

export const patientColumns: Column<PatientResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: PatientResponse) => `${element.id}`,
    type: 'number',
  },
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: PatientResponse) => `${element.name}`,
    type: 'text',
  },
  {
    columnDef: 'email',
    header: 'Email',
    cell: (element: PatientResponse) => `${element.email}`,
    type: 'text',
  },
];

export const doctorPatientColumns: Column<DoctorPatientResponse>[] = [
  {
    columnDef: 'patientProfileId',
    header: 'ID',
    cell: (element: DoctorPatientResponse) => `${element.patientProfileId}`,
    type: 'number',
  },
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: DoctorPatientResponse) => `${element.name}`,
    type: 'text',
  },
  {
    columnDef: 'email',
    header: 'Email',
    cell: (element: DoctorPatientResponse) => `${element.email}`,
    type: 'text',
  },
  {
    columnDef: 'totalAppointments',
    header: 'Total Appointments',
    cell: (element: DoctorPatientResponse) => `${element.totalAppointments}`,
    type: 'number',
  },
  {
    columnDef: 'lastAppointmentDate',
    header: 'Last Appointment Date',
    cell: (element: DoctorPatientResponse) => `${element.lastAppointmentDate}`,
    type: 'date',
  },
];
