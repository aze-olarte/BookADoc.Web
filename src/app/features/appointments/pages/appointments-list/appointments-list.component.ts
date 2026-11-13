import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Action } from '../../../../core/models/action';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { Column } from '../../../../core/models/columns';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { AuthService } from '../../../auth/services/auth.service';
import { AppointmentsAddFormComponent } from '../../components/appointments-add-form/appointments-add-form.component';
import { AppointmentsNotesFormComponent } from '../../components/appointments-notes-form/appointments-notes-form.component';
import { AppointmentsStatusFormComponent } from '../../components/appointments-status-form/appointments-status-form.component';
import { AppointmentService } from '../../services/appointment.service';
import { columns } from './appointments-list-columns';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-appointments-list',
  imports: [GridComponent, MatButtonModule, MatIconModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsListComponent {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
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
      error: () => {},
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
      type: 'updateNotes',
      label: 'Update Notes',
      icon: 'edit',
      visible: (item) => this.isUpdateNotesVisible(item),
    },
  ];

  onActionTriggered({ action, row }: { action: string; row: AppointmentResponse }) {
    if (action === 'view') {
      this.onView(row.id);
    } else if (action === 'changeStatus') {
      this.onChangeStatus(row);
    } else if (action === 'updateNotes') {
      this.onUpdateNotes(row);
    }
  }

  onView(id: number) {
    this.router.navigate(['/portal/appointments', id]);
  }

  onChangeStatus(data: AppointmentResponse) {
    const dialogRef = this.dialog.open(AppointmentsStatusFormComponent, {
      disableClose: true,
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

  onUpdateNotes(data: AppointmentResponse) {
    const dialogRef = this.dialog.open(AppointmentsNotesFormComponent, {
      disableClose: true,
      data: {
        id: data.id,
        notes: data.notes,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }

  onAddAppointment() {
    const dialogRef = this.dialog.open(AppointmentsAddFormComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadData();
      }
    });
  }

  onGenerateReport() {
    this.appointmentService.getAppointmentReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointment-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {},
    });
  }

  private isChangeStatusVisible(data: AppointmentResponse): boolean {
    if (this.role === 'Admin') {
      return false;
    }

    switch (data.status) {
      case 'Cancelled':
      case 'Completed':
        return false;
      default:
        return true;
    }
  }

  private isUpdateNotesVisible(data: AppointmentResponse): boolean {
    if (this.role === 'Doctor' && data.status === 'Completed') {
      return true;
    }
    return false;
  }
}
