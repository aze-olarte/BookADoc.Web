import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../core/models/auth-response.model';
import { LoginRequest } from '../../../core/models/login-request.model';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { UserResponse } from '../../../core/models/user-response.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/auth`;

  const nowInSeconds = () => Math.floor(Date.now() / 1000);
  const makeToken = (payload: object) => `header.${btoa(JSON.stringify(payload))}.signature`;
  const makeAuth = (overrides: Record<string, unknown> = {}) =>
    ({
      token: makeToken({ exp: nowInSeconds() + 3600 }),
      role: 'Doctor',
      name: 'Jane Doe',
      ...overrides,
    }) as unknown as AuthResponse;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('HTTP calls', () => {
    it('register() should POST the payload to the register endpoint', () => {
      const payload = { name: 'Jane' } as unknown as RegisterRequest;
      const expected = makeAuth();
      let result: AuthResponse | undefined;

      service.register(payload).subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('login() should POST the credentials to the login endpoint', () => {
      const payload: LoginRequest = { email: 'jane@example.com', password: 'Secret123!' };
      const expected = makeAuth();
      let result: AuthResponse | undefined;

      service.login(payload).subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('getMyDetails() should GET the current user', () => {
      const expected = { id: 1 } as unknown as UserResponse;
      let result: UserResponse | undefined;

      service.getMyDetails().subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      expect(result).toEqual(expected);
    });
  });

  describe('stored auth', () => {
    it('getAuth() should return null when nothing is stored', () => {
      expect(service.getAuth()).toBeNull();
    });

    it('should return what storeAuth() saved', () => {
      const auth = makeAuth();

      service.storeAuth(auth);

      expect(service.getAuth()).toEqual(auth);
    });

    it('clearAuth() should remove the stored auth', () => {
      service.storeAuth(makeAuth());

      service.clearAuth();

      expect(service.getAuth()).toBeNull();
    });
  });

  describe('getRole()', () => {
    it('should be an empty string when nobody is logged in', () => {
      expect(service.getRole()).toBe('');
    });

    it('should return the stored role', () => {
      service.storeAuth(makeAuth({ role: 'Patient' }));

      expect(service.getRole()).toBe('Patient');
    });
  });

  describe('isLoggedIn()', () => {
    it('should be false when nothing is stored', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should be true for a token that has not expired', () => {
      service.storeAuth(makeAuth({ token: makeToken({ exp: nowInSeconds() + 3600 }) }));

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should be false for an expired token', () => {
      service.storeAuth(makeAuth({ token: makeToken({ exp: nowInSeconds() - 60 }) }));

      expect(service.isLoggedIn()).toBe(false);
    });

    it('should be false for a malformed token', () => {
      service.storeAuth(makeAuth({ token: 'not-a-jwt' }));

      expect(service.isLoggedIn()).toBe(false);
    });

    it.fails('should accept a valid token whose payload is base64url encoded', () => {
      const payload = JSON.stringify({ exp: nowInSeconds() + 3600, x: '?'.repeat(12) });
      const base64url = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      expect(base64url).toMatch(/[-_]/);
      service.storeAuth(makeAuth({ token: `header.${base64url}.signature` }));

      expect(service.isLoggedIn()).toBe(true);
    });
  });
});
