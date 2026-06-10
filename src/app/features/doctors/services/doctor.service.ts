import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { DoctorResponse } from '../../../core/models/doctor-response.model';
import { DoctorSummaryResponse } from '../../../core/models/doctor-summary-response.model';
import { SlotResponse } from '../../../core/models/slot-response.model';
import { format, startOfDay } from 'date-fns';

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

  getSlots(id: number, fromDate: Date, toDate: Date): Observable<SlotResponse[]> {
    const params = new HttpParams()
      .set('fromDate', format(fromDate, 'yyyy-MM-dd'))
      .set('toDate', format(toDate, 'yyyy-MM-dd'));

    return this.http.get<SlotResponse[]>(`${this.apiUrl}/${id}/slots`, { params });
  }
}
