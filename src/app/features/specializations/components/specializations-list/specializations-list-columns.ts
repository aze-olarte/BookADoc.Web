import { SpecializationResponse } from '../../../../core/models/specialization-response.model';

export const columns = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (element: SpecializationResponse) => `${element.id}`,
  },
  {
    columnDef: 'name',
    header: 'Name',
    cell: (element: SpecializationResponse) => `${element.name}`,
  },
];
