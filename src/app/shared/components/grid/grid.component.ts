import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Column } from '../../../core/models/columns';
import { Action } from '../../../core/models/action';

@Component({
  selector: 'app-grid',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatMenuModule],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent<T> {
  data = input.required<T[]>();
  columns = input.required<Column<any>[]>();
  actions = input<Action<T>[]>([]);

  dataSource = new MatTableDataSource<T>([]);
  displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.columnDef);
    return this.actions().length ? [...cols, 'actions'] : cols;
  });
  actionTriggered = output<{ action: string; row: any }>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onActionClick(action: string, row: unknown) {
    this.actionTriggered.emit({ action, row });
  }

  rowActions = computed(() => {
    const map = new Map<T, Action<T>[]>();
    for (const row of this.dataSource.data) {
      map.set(
        row,
        this.actions().filter((action) => (action.visible ? action.visible(row) : true)),
      );
    }
    return map;
  });
}
