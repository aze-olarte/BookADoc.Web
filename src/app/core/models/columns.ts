export interface Column<T> {
  columnDef: string;
  header: string;
  cell: (element: T) => string;
}
