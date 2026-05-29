import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpecializationService } from '../../services/specialization.service';
import { columns } from './specializations-list-columns';
import { SpecializationsFormComponent } from '../specializations-form/specializations-form.component';

@Component({
  selector: 'app-specializations-list',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatMenuModule],
  templateUrl: './specializations-list.component.html',
  styleUrl: './specializations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsListComponent implements OnInit, AfterViewInit {
  private specializationService = inject(SpecializationService);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<SpecializationResponse>([]);
  readonly columns = columns;
  displayedColumns = [...columns.map((c) => c.columnDef), 'actions'];

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    this.specializationService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => this.toastService.error(error),
    });
  }

  onDelete(data: SpecializationResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Specialization',
        message: `Are you sure you want to delete ${data.name}?`,
        confirmLabel: 'Delete',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.specializationService.delete(data.id).subscribe({
          next: () => {
            this.toastService.success('Specialization deleted');
            this.loadData();
          },
          error: (error) => {
            this.toastService.error(error);
          },
        });
      }
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(SpecializationsFormComponent);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }
}
