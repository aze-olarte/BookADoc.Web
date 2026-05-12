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

    const mockResponse = {
      token: 'mock-token',
    };
    service.register(payload).subscribe((res) => {
      expect(res.token).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockResponse);
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
    const data = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      role: UserRole.Patient,
      token: 'mock-token',
    };
    service.storeAuth(data);
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

    const data = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      role: UserRole.Patient,
      token: 'mock-token',
    };

    localStorage.setItem('authData', JSON.stringify(data));
    const result = service.getAuth();
    expect(result).toEqual(data);
  });
});
