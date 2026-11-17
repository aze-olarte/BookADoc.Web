import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { DoctorPatientResponse } from '../../../core/models/doctor-patient-response.model';
import { PatientResponse } from '../../../core/models/patient-response.model';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const patients = [{ id: 1 }, { id: 2 }] as PatientResponse[];
  const doctorPatients = [{ patientProfileId: 3 }] as DoctorPatientResponse[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET all patients', () => {
      let result: PatientResponse[] | undefined;

      service.getAll().subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${environment.apiUrl}/patient`);
      expect(req.request.method).toBe('GET');
      req.flush(patients);
      expect(result).toEqual(patients);
    });

    it('should return an empty list when there are no patients', () => {
      let result: PatientResponse[] | undefined;

      service.getAll().subscribe((r) => (result = r));

      httpMock.expectOne(`${environment.apiUrl}/patient`).flush([]);
      expect(result).toEqual([]);
    });

    it('should propagate HTTP errors to the subscriber', () => {
      let status: number | undefined;

      service.getAll().subscribe({ error: (e) => (status = e.status) });

      httpMock.expectOne(`${environment.apiUrl}/patient`).flush('Forbidden', {
        status: 403,
        statusText: 'Forbidden',
      });
      expect(status).toBe(403);
    });
  });

  describe('getPatientsByDoctor()', () => {
    it("should GET the given doctor's patients", () => {
      let result: DoctorPatientResponse[] | undefined;

      service.getPatientsByDoctor(12).subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${environment.apiUrl}/doctor/12/patients`);
      expect(req.request.method).toBe('GET');
      req.flush(doctorPatients);
      expect(result).toEqual(doctorPatients);
    });

    it('should use the doctor id in the URL', () => {
      service.getPatientsByDoctor(99).subscribe();

      httpMock.expectOne(`${environment.apiUrl}/doctor/99/patients`).flush([]);
    });

    it('should propagate HTTP errors to the subscriber', () => {
      let status: number | undefined;

      service.getPatientsByDoctor(12).subscribe({ error: (e) => (status = e.status) });

      httpMock.expectOne(`${environment.apiUrl}/doctor/12/patients`).flush('Not found', {
        status: 404,
        statusText: 'Not Found',
      });
      expect(status).toBe(404);
    });
  });
});
