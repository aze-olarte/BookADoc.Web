import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Action } from '../../../../core/models/action';
import { Column } from '../../../../core/models/columns';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SpecializationsFormComponent } from '../../components/specializations-form/specializations-form.component';
import { SpecializationService } from '../../services/specialization.service';
import { columns } from './specializations-list-columns';

@Component({
  selector: 'app-specializations-list',
  imports: [GridComponent, MatIconModule, MatButtonModule],
  templateUrl: './specializations-list.component.html',
  styleUrl: './specializations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsListComponent implements OnInit {
  private specializationService = inject(SpecializationService);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);

  data = signal<SpecializationResponse[]>([]);
  readonly columnDefs: Column<SpecializationResponse>[] = columns;

  actions: Action<SpecializationResponse>[] = [
    { type: 'delete', label: 'Delete', icon: 'delete_outline' },
  ];

  onActionTriggered({ action, row }: { action: string; row: SpecializationResponse }) {
    if (action === 'delete') {
      this.onDelete(row);
    }
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.specializationService.getAll().subscribe({
      next: (data) => {
        this.data.set(data);
      },
      error: () => {},
    });
  }

  onDelete(data: SpecializationResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
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
    const dialogRef = this.dialog.open(SpecializationsFormComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }
}
