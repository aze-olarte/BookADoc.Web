import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { format } from 'date-fns';
import { SlotResponse } from '../../../core/models/slot-response.model';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/doctor`;

  getSlots(id: number, fromDate: Date, toDate: Date): Observable<SlotResponse[]> {
    const params = new HttpParams()
      .set('fromDate', format(fromDate, 'yyyy-MM-dd'))
      .set('toDate', format(toDate, 'yyyy-MM-dd'));

    return this.http.get<SlotResponse[]>(`${this.apiUrl}/${id}/slots`, { params });
  }
}
