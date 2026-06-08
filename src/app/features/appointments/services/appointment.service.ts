import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AppointmentResponse } from '../../../core/models/appointment-response.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentStatus } from '../../../core/models/appointment-status.enum';
import { UserRole } from '../../../core/models/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/appointment`;

  getAll(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}`);
  }

  getUserAppointments(): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/mine`);
  }

  patchAppointmentStatus(id: number, payload: { status: string }): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, payload);
  }

  addNotes(id: number, notes: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/notes`, notes);
  }

  getStatusDropdownOptions(role: string, status: string): string[] {
    if (role === UserRole.Patient) {
      return this.setPatientStatusOptions(status);
    } else if (role === UserRole.Doctor) {
      return this.setDoctorStatusOptions(status);
    }
    return this.setAdminStatusOptions(status);
  }

  setPatientStatusOptions(currentStatus: string): string[] {
    if (currentStatus === 'Pending' || currentStatus === 'Confirmed') {
      return ['Cancelled'];
    }
    return [];
  }

  setDoctorStatusOptions(currentStatus: string) {
    if (currentStatus === 'Pending') {
      return ['Confirmed'];
    } else if (currentStatus === 'Confirmed') {
      return ['Completed', 'Cancelled'];
    }
    return [];
  }

  setAdminStatusOptions(currentStatus: string) {
    if (currentStatus === 'Pending') {
      return ['Confirmed', 'Cancelled'];
    } else if (currentStatus === 'Confirmed') {
      return ['Completed', 'Cancelled'];
    }
    return [];
  }
}
