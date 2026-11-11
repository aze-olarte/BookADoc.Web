import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PatientResponse } from '../../../core/models/patient-response.model';
import { DoctorPatientResponse } from '../../../core/models/doctor-patient-response.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/patient`;

  getAll(): Observable<PatientResponse[]> {
    return this.http.get<PatientResponse[]>(`${this.apiUrl}`);
  }

  getPatientsByDoctor(doctorId: number): Observable<DoctorPatientResponse[]> {
    return this.http.get<DoctorPatientResponse[]>(
      `${environment.apiUrl}/doctor/${doctorId}/patients`,
    );
  }
}
