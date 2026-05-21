import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../../core/models/user-role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let apiUrl = environment.apiUrl;
  const mockData = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    role: UserRole.Patient,
    token: 'mock-token',
  };

  const createMockToken = (exp: number): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp }));
    return `${header}.${payload}.signature`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow registration', () => {
    const payload = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'JohnDo321',
      role: UserRole.Patient,
    };

    service.register(payload).subscribe((res) => {
      expect(res.token).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockData);
  });

  it('should allow login', () => {
    const payload = {
      email: 'johndoe@example.com',
      password: 'JohnDo321',
    };
    service.login(payload).subscribe((res) => {
      expect(res.email).toBe(payload.email);
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
  });

  it('should get the current user details', () => {
    service.getMyDetails().subscribe((res) => {
      expect(res.id).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/mine`);
    expect(req.request.method).toBe('GET');
  });

  it('should store auth response in local storage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    service.storeAuth(mockData);
    expect(setItemSpy).toHaveBeenCalledOnce();
  });

  it('should clear auth response in local storage', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    service.clearAuth();
    expect(removeItemSpy).toHaveBeenCalledOnce();
  });

  it('should return the auth response from local storage', () => {
    const emptyResult = service.getAuth();
    expect(emptyResult).toBeNull();

    localStorage.setItem('authData', JSON.stringify(mockData));
    const result = service.getAuth();
    expect(result).toEqual(mockData);
  });

  it('should return false when auth data does not exist', () => {
    localStorage.clear();

    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return the user role', () => {
    expect(service.getRole()).toBe('');

    localStorage.setItem('authData', JSON.stringify(mockData));
    expect(service.getRole()).toBe('Patient');
  });

  it('should return true when token is not expired', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const token = createMockToken(1_700_000_100);

    localStorage.setItem(
      'authData',

      JSON.stringify({ token }),
    );

    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when token is expired', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const token = createMockToken(1_699_999_000);

    localStorage.setItem(
      'authData',

      JSON.stringify({ token }),
    );

    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return false when token is invalid', () => {
    localStorage.setItem(
      'authData',

      JSON.stringify({
        token: 'invalid-token',
      }),
    );

    expect(service.isLoggedIn()).toBe(false);
  });
});
