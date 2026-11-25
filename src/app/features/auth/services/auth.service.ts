import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../core/models/auth-response.model';
import { LoginRequest } from '../../../core/models/login-request.model';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { UserResponse } from '../../../core/models/user-response.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private accessToken: string | null = null;
  private refresh$: Observable<AuthResponse> | null = null;
  readonly user = signal<AuthResponse | null>(null);
  private router = inject(Router);

  getAccessToken() {
    return this.accessToken;
  }

  private setSession(res: AuthResponse) {
    this.accessToken = res.token;
    this.user.set(res);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload, { withCredentials: true })
      .pipe(tap((res) => this.setSession(res)));
  }

  getMyDetails(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }

  refresh(): Observable<AuthResponse> {
    if (!this.refresh$) {
      this.refresh$ = this.http
        .post<AuthResponse>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
        .pipe(
          tap((res) => this.setSession(res)),
          finalize(() => (this.refresh$ = null)),
          shareReplay(1),
        );
    }
    return this.refresh$;
  }

  logout(): void {
    this.http
      .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(finalize(() => this.clearSession()))
      .subscribe({ error: () => {} });
  }

  clearSession() {
    this.accessToken = null;
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}
