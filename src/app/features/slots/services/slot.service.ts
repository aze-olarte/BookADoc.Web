import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SlotRequest } from '../../../core/models/slot-request.model';
import { SlotResponse } from '../../../core/models/slot-response.model';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/doctor`;

  getSlots(id: number, fromDate?: Date, toDate?: Date): Observable<SlotResponse[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', format(fromDate, 'yyyy-MM-dd'));
    }
    if (toDate) {
      params = params.set('toDate', format(toDate, 'yyyy-MM-dd'));
    }
    return this.http.get<SlotResponse[]>(`${this.apiUrl}/${id}/slots`, { params });
  }

  addSlot(doctorId: number, payload: SlotRequest) {
    return this.http.post<SlotRequest>(`${this.apiUrl}/${doctorId}/slots`, payload);
  }

  updateSlot(doctorId: number, payload: SlotRequest) {
    return this.http.put<SlotRequest>(`${this.apiUrl}/${doctorId}/slots`, payload);
  }

  deleteSlot(doctorId: number, slotId: number) {
    return this.http.delete<void>(`${this.apiUrl}/${doctorId}/slots/${slotId}`);
  }
}
