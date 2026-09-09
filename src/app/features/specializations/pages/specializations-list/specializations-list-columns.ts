import { Column } from '../../../../core/models/columns';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';

export const columns: Column<SpecializationResponse>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: SpecializationResponse) => `${element.id}`,
    type: 'number',
  },
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: SpecializationResponse) => `${element.name}`,
    type: 'text',
  },
];
