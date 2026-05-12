import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserRole } from '../models/shared/user-role.enum';
import { environment } from '../../../environments/environment';

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
});
