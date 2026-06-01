import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SpecializationResponse } from '../models/specialization-response.model';
import { SpecializationRequest } from '../models/specialization-request.model';

@Injectable({
  providedIn: 'root',
})
export class SpecializationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/specialization`;

  getAll(): Observable<SpecializationResponse[]> {
    return this.http.get<SpecializationResponse[]>(`${this.apiUrl}`);
  }

  add(payload: SpecializationRequest): Observable<SpecializationResponse> {
    return this.http.post<SpecializationResponse>(`${this.apiUrl}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
