import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DoctorResponse } from '../../../core/models/doctor-response.model';
import { DoctorSummaryResponse } from '../../../core/models/doctor-summary-response.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/doctor`;

  getAll(specializationId: number): Observable<DoctorSummaryResponse[]> {
    let params = new HttpParams();
    if (specializationId !== 0) {
      params = params.set('specializationId', specializationId);
    }
    return this.http.get<DoctorSummaryResponse[]>(`${this.apiUrl}`, { params });
  }

  get(id: number): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/${id}`);
  }
}
