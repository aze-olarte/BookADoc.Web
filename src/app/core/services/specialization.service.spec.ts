import { TestBed } from '@angular/core/testing';

import { SpecializationService } from './specialization.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

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

  it('should create specialization', () => {
    const payload = {
      name: 'OB Gyne',
    };

    service.add(payload).subscribe((res) => {
      expect(res.id).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
  });

  it('should delete specialization', () => {
    const id = 1;
    service.delete(id).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
