import { Column } from '../../../../core/models/columns';
import { PatientResponse } from '../../../../core/models/patient-response.model';

export const columns: Column<PatientResponse>[] = [
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
