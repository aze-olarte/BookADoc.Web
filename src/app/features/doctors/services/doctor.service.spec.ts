import { TestBed } from '@angular/core/testing';

import { DoctorService } from './doctor.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('DoctorService', () => {
  let service: DoctorService;
  let httpMock: HttpTestingController;
  let apiUrl = `${environment.apiUrl}/doctor`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DoctorService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DoctorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all doctors', () => {
    service.getAll(0).subscribe((res) => {
      expect(res.length).toBeGreaterThan(1);
    });
    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('GET');
  });

  it('should get doctors filtered by specialization', () => {
    service.getAll(1).subscribe((res) => {
      expect(res.length).toBeGreaterThan(1);
    });
    const req = httpMock.expectOne(`${apiUrl}?specializationId=1`);
    expect(req.request.method).toBe('GET');
  });

  it('should get doctor by id', () => {
    service.get(1).subscribe((res) => {
      expect(res.id).toBeTruthy();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
  });
});
