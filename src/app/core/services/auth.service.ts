import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RegisterRequest } from '../models/auth/register-request.model';
import { AuthResponse } from '../models/auth/auth-response.model';
import { Observable } from 'rxjs';
import { LoginRequest } from '../models/auth/login-request.model';
import { UserResponse } from '../models/user/user-response.model';

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
