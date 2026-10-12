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
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
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

  isLoggedIn(): boolean {
    const token = this.getAuth()?.token;
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;

    const now = Math.floor(Date.now() / 1000);
    return decodedToken.exp > now;
  }

  getRole(): string {
    const userData = this.getAuth();
    if (!userData) return '';

    return userData.role;
  }

  private decodeToken(token: string) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
