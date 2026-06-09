import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Action } from '../../../../core/models/action';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SpecializationService } from '../../../../core/services/specialization.service';
import { SpecializationsFormComponent } from '../../components/specializations-form/specializations-form.component';
import { columns } from './specializations-list-columns';
import { Column } from '../../../../core/models/columns';

@Component({
  selector: 'app-specializations-list',
  imports: [GridComponent],
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

  // Define actions
  actions: Action<SpecializationResponse>[] = [
    { type: 'delete', label: 'Delete', icon: 'delete_outline' },
  ];

  // Handle the output
  onActionTriggered({ action, row }: { action: string; row: SpecializationResponse }) {
    console.log(action);
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
