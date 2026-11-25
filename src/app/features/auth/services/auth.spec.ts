import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../core/models/auth-response.model';
import { UserRole } from '../../../core/models/user-role.enum';
import { LoginRequest } from '../../../core/models/login-request.model';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { UserResponse } from '../../../core/models/user-response.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const apiUrl = `${environment.apiUrl}/auth`;

  const authResponse: AuthResponse = {
    id: 1,
    token: 'access-token-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.Patient,
    patientProfileId: 10,
  };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with no session', () => {
    expect(service).toBeTruthy();
    expect(service.getAccessToken()).toBeNull();
    expect(service.user()).toBeNull();
  });

  describe('register', () => {
    it('should POST to /register and set the session', () => {
      const payload = {
        email: 'john@example.com',
        password: 'secret',
      } as unknown as RegisterRequest;
      let result: AuthResponse | undefined;

      service.register(payload).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(authResponse);

      expect(result).toEqual(authResponse);
      expect(service.getAccessToken()).toBe(authResponse.token);
      expect(service.user()).toEqual(authResponse);
    });

    it('should not set the session on error', () => {
      const payload = {} as RegisterRequest;
      let errored = false;

      service.register(payload).subscribe({ error: () => (errored = true) });

      httpMock
        .expectOne(`${apiUrl}/register`)
        .flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

      expect(errored).toBe(true);
      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
    });
  });

  describe('login', () => {
    it('should POST to /login and set the session', () => {
      const payload = { email: 'john@example.com', password: 'secret' } as unknown as LoginRequest;
      let result: AuthResponse | undefined;

      service.login(payload).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(authResponse);

      expect(result).toEqual(authResponse);
      expect(service.getAccessToken()).toBe(authResponse.token);
      expect(service.user()).toEqual(authResponse);
    });

    it('should not set the session on error', () => {
      const payload = {} as LoginRequest;
      let errored = false;

      service.login(payload).subscribe({ error: () => (errored = true) });

      httpMock
        .expectOne(`${apiUrl}/login`)
        .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(errored).toBe(true);
      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
    });
  });

  describe('getMyDetails', () => {
    it('should GET /me', () => {
      const me = { id: 1, email: 'john@example.com' } as unknown as UserResponse;
      let result: UserResponse | undefined;

      service.getMyDetails().subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(me);

      expect(result).toEqual(me);
    });
  });

  describe('refresh', () => {
    it('should POST to /refresh with credentials and set the session', () => {
      let result: AuthResponse | undefined;

      service.refresh().subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBe(true);
      req.flush(authResponse);

      expect(result).toEqual(authResponse);
      expect(service.getAccessToken()).toBe(authResponse.token);
      expect(service.user()).toEqual(authResponse);
    });

    it('should share a single in-flight request between concurrent callers', () => {
      const results: AuthResponse[] = [];

      service.refresh().subscribe((res) => results.push(res));
      service.refresh().subscribe((res) => results.push(res));
      service.refresh().subscribe((res) => results.push(res));

      // expectOne fails if more than one request was made
      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      req.flush(authResponse);

      expect(results).toHaveLength(3);
      results.forEach((r) => expect(r).toEqual(authResponse));
    });

    it('should allow a new refresh request after the previous one completes', () => {
      service.refresh().subscribe();
      httpMock.expectOne(`${apiUrl}/refresh`).flush(authResponse);

      service.refresh().subscribe();
      const second = httpMock.expectOne(`${apiUrl}/refresh`);
      second.flush({ ...authResponse, token: 'new-token' });

      expect(service.getAccessToken()).toBe('new-token');
    });

    it('should reset the in-flight request after an error so it can be retried', () => {
      let errored = false;

      service.refresh().subscribe({ error: () => (errored = true) });
      httpMock
        .expectOne(`${apiUrl}/refresh`)
        .flush({ message: 'Expired' }, { status: 401, statusText: 'Unauthorized' });

      expect(errored).toBe(true);
      expect(service.getAccessToken()).toBeNull();

      service.refresh().subscribe();
      httpMock.expectOne(`${apiUrl}/refresh`).flush(authResponse);

      expect(service.getAccessToken()).toBe(authResponse.token);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service.login({} as LoginRequest).subscribe();
      httpMock.expectOne(`${apiUrl}/login`).flush(authResponse);
    });

    it('should POST to /logout, clear the session and navigate to /login', () => {
      service.logout();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should still clear the session when the logout request fails', () => {
      service.logout();

      httpMock
        .expectOne(`${apiUrl}/logout`)
        .flush({ message: 'Server error' }, { status: 500, statusText: 'Server Error' });

      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('clearSession', () => {
    it('should reset token and user, then navigate to /login', () => {
      service.login({} as LoginRequest).subscribe();
      httpMock.expectOne(`${apiUrl}/login`).flush(authResponse);
      expect(service.getAccessToken()).toBe(authResponse.token);

      service.clearSession();

      expect(service.getAccessToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
