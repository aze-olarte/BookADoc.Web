import { Component, inject, signal } from '@angular/core';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { Column } from '../../../../core/models/columns';
import { ToastService } from '../../../../core/services/toast.service';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { AuthService } from '../../../auth/services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { columns } from './appointments-list-columns';

@Component({
  selector: 'app-appointments-list',
  imports: [GridComponent],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.scss',
})
export class AppointmentsListComponent {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
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
}
