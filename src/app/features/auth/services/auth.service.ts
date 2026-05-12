import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../core/models/auth-response.model';
import { LoginRequest } from '../../../core/models/login-request.model';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { UserResponse } from '../../../core/models/user-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private key = 'authData';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }

  getMyDetails(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/mine`);
  }

  storeAuth(data: AuthResponse) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  getAuth(): AuthResponse | null {
    const value = localStorage.getItem(this.key);
    return value ? (JSON.parse(value) as AuthResponse) : null;
  }

  clearAuth(): void {
    localStorage.removeItem(this.key);
  }
}
