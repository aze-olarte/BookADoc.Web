import { TestBed } from '@angular/core/testing';

import { SpecializationService } from './specialization.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

describe('SpecializationService', () => {
  let service: SpecializationService;
  let httpMock: HttpTestingController;
  let apiUrl = `${environment.apiUrl}/specialization`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecializationService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SpecializationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all specializations', () => {
    service.getAll().subscribe((res) => {
      expect(res.length).toBeGreaterThan(1);
    });
    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('GET');
  });
});
