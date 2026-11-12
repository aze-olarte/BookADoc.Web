import { Column } from '../../../../core/models/columns';
import { DoctorSummaryResponse } from '../../../../core/models/doctor-summary-response.model';

export const columns: Column<DoctorSummaryResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: DoctorSummaryResponse) => `${element.id}`,
    type: 'number',
  },
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: DoctorSummaryResponse) => `${element.name}`,
    type: 'text',
  },
  {
    columnDef: 'specialization',
    header: 'Specialization',
    cell: (element: DoctorSummaryResponse) => `${element.specialization.name}`,
    type: 'text',
  },
];
