import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SpecializationResponse } from '../models/specialization-response.model';

@Injectable({
  providedIn: 'root',
})
export class SpecializationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/specialization`;

  getAll(): Observable<SpecializationResponse[]> {
    return this.http.get<SpecializationResponse[]>(`${this.apiUrl}`);
  }
}
