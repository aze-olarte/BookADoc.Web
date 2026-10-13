import { Component, inject, signal } from '@angular/core';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { PatientService } from '../../services/patient.service';
import { PatientResponse } from '../../../../core/models/patient-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { columns } from './patient-list-columns';
import { Column } from '../../../../core/models/columns';

@Component({
  selector: 'app-patients-list',
  imports: [GridComponent],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent {
  private patientService = inject(PatientService);
  private toastService = inject(ToastService);
  data = signal<PatientResponse[]>([]);
  readonly columnDefs: Column<PatientResponse>[] = columns;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.data.set(data);
      },
      error: () => {},
    });
  }
}
