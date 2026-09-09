export interface Column<T> {
  columnDef: string;
  header: string;
  cell: (element: T) => string;
  type: ColumnType;
}

export type ColumnType = 'text' | 'number' | 'date' | 'time' | 'boolean';
