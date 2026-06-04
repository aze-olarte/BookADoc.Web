import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AppointmentResponse } from '../../../core/models/appointment-response.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentStatus } from '../../../core/models/appointment-status.enum';

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

  patchAppointmentStatus(id: number, status: AppointmentStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, status);
  }

  addNotes(id: number, notes: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/notes`, notes);
  }
}
