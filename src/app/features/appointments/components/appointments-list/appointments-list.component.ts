import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Action } from '../../../../core/models/action';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { Column } from '../../../../core/models/columns';
import { ToastService } from '../../../../core/services/toast.service';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { AuthService } from '../../../auth/services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsNotesFormComponent } from '../appointments-notes-form/appointments-notes-form.component';
import { AppointmentsStatusFormComponent } from '../appointments-status-form/appointments-status-form.component';
import { columns } from './appointments-list-columns';
import { AppointmentsAddFormComponent } from '../appointments-add-form/appointments-add-form.component';

@Component({
  selector: 'app-appointments-list',
  imports: [GridComponent],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsListComponent {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  data = signal<AppointmentResponse[]>([]);
  columnDefs: Column<AppointmentResponse>[] = columns;
  role: string = this.authService.getRole();

  ngOnInit() {
    this.setColumns();
    this.loadData();
  }

  private setColumns(): void {
    switch (this.role) {
      case 'Patient':
        this.columnDefs = columns.filter((c) => c.columnDef !== 'patientName');
        break;
      case 'Doctor':
        this.columnDefs = columns.filter((c) => c.columnDef !== 'doctorName');
        break;
      default:
        this.columnDefs = columns;
    }
  }

  loadData() {
    const observable$ =
      this.role === 'Admin'
        ? this.appointmentService.getAll()
        : this.appointmentService.getUserAppointments();
    observable$.subscribe({
      next: (data) => {
        this.data.set(data);
      },
      error: (error) => this.toastService.error(error),
    });
  }

  actions: Action<AppointmentResponse>[] = [
    { type: 'view', label: 'View', icon: 'visibility' },
    {
      type: 'changeStatus',
      label: 'Change Status',
      icon: 'edit',
      visible: (item) => this.isChangeStatusVisible(item),
    },
    {
      type: 'addNotes',
      label: 'Add Notes',
      icon: 'edit',
      visible: (item) => this.isAddNotesVisible(item),
    },
  ];

  onActionTriggered({ action, row }: { action: string; row: AppointmentResponse }) {
    if (action === 'view') {
      this.onView(row.id);
    } else if (action === 'changeStatus') {
      this.onChangeStatus(row);
    } else if (action === 'addNotes') {
      this.onAddNotes(row);
    }
  }

  onView(id: number) {
    this.router.navigate(['/portal/appointments', id]);
  }

  onChangeStatus(data: AppointmentResponse) {
    const dialogRef = this.dialog.open(AppointmentsStatusFormComponent, {
      data: {
        id: data.id,
        role: this.role,
        status: data.status,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }

  onAddNotes(data: AppointmentResponse) {
    const dialogRef = this.dialog.open(AppointmentsNotesFormComponent, {
      data: {
        id: data.id,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }

  onAddAppointment() {
    const dialogRef = this.dialog.open(AppointmentsAddFormComponent);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }

  private isChangeStatusVisible(data: AppointmentResponse): boolean {
    switch (data.status) {
      case 'Cancelled':
      case 'Completed':
        return false;
      default:
        return true;
    }
  }

  private isAddNotesVisible(data: AppointmentResponse): boolean {
    if (this.role === 'Doctor' && data.status === 'Completed') {
      return true;
    }
    return false;
  }
}
