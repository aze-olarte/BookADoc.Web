import { Component, inject, OnInit, signal } from '@angular/core';
import { DoctorPatientResponse } from '../../../../core/models/doctor-patient-response.model';
import { PatientResponse } from '../../../../core/models/patient-response.model';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { AuthService } from '../../../auth/services/auth.service';
import { PatientService } from '../../services/patient.service';
import { doctorPatientColumns, patientColumns } from './patient-list-columns';

@Component({
  selector: 'app-patients-list',
  imports: [GridComponent],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.scss',
})
export class PatientsListComponent implements OnInit {
  private patientService = inject(PatientService);
  private authService = inject(AuthService);

  readonly isDoctor = this.authService.getRole() === 'Doctor';

  patients = signal<PatientResponse[]>([]);
  doctorPatients = signal<DoctorPatientResponse[]>([]);

  readonly patientColumns = patientColumns;
  readonly doctorPatientColumns = doctorPatientColumns;

  ngOnInit() {
    if (this.isDoctor) {
      const doctorProfileId = this.authService.getAuth()?.doctorProfileId!;
      this.patientService.getPatientsByDoctor(doctorProfileId).subscribe({
        next: (data) => {
          this.doctorPatients.set(data);
        },
        error: () => {},
      });
    } else {
      this.patientService.getAll().subscribe({
        next: (data) => {
          this.patients.set(data);
        },
        error: () => {},
      });
    }
  }
}
