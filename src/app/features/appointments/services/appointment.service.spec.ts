import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AppointmentRequest } from '../../../core/models/appointment-request.model';
import { AppointmentResponse } from '../../../core/models/appointment-response.model';
import { UserRole } from '../../../core/models/user-role.enum';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/appointment`;
  const reportApiUrl = `${environment.apiUrl}/report`;

  const makeAppointment = (id: number) => ({ id }) as AppointmentResponse;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('HTTP calls', () => {
    it('getAll() should GET all appointments', () => {
      const expected = [makeAppointment(1), makeAppointment(2)];
      let result: AppointmentResponse[] | undefined;

      service.getAll().subscribe((r) => (result = r));

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('getUserAppointments() should GET the current user appointments', () => {
      const expected = [makeAppointment(3)];
      let result: AppointmentResponse[] | undefined;

      service.getUserAppointments().subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/mine`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('get() should GET a single appointment by id', () => {
      const expected = makeAppointment(7);
      let result: AppointmentResponse | undefined;

      service.get(7).subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/7`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('addAppointment() should POST the payload', () => {
      const payload = { slotId: 5, reason: 'Checkup' } as unknown as AppointmentRequest;
      const expected = makeAppointment(10);
      let result: AppointmentResponse | undefined;

      service.addAppointment(payload).subscribe((r) => (result = r));

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(expected);
      expect(result).toEqual(expected);
    });

    it('patchAppointmentStatus() should PATCH the status endpoint', () => {
      let completed = false;

      service.patchAppointmentStatus(4, { status: 'Confirmed' }).subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne(`${apiUrl}/4/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'Confirmed' });
      req.flush(null);
      expect(completed).toBe(true);
    });

    it('addNotes() should PATCH the notes endpoint', () => {
      let completed = false;

      service.addNotes(4, { notes: 'Follow up in 2 weeks' }).subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne(`${apiUrl}/4/notes`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ notes: 'Follow up in 2 weeks' });
      req.flush(null);
      expect(completed).toBe(true);
    });

    it('getAppointmentReport() should GET the PDF as a blob', () => {
      const blob = new Blob(['pdf'], { type: 'application/pdf' });
      let result: Blob | undefined;

      service.getAppointmentReport().subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${reportApiUrl}/appointments/pdf`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(blob);
      expect(result).toBe(blob);
    });

    it('should propagate HTTP errors to the subscriber', () => {
      let status: number | undefined;

      service.getAll().subscribe({ error: (e) => (status = e.status) });

      httpMock.expectOne(apiUrl).flush('Server error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      expect(status).toBe(500);
    });
  });

  describe('setPatientStatusOptions()', () => {
    it.each([
      ['Pending', ['Cancelled']],
      ['Confirmed', ['Cancelled']],
      ['Completed', []],
      ['Cancelled', []],
      ['Unknown', []],
    ])('from %s should offer %j', (status, expected) => {
      expect(service.setPatientStatusOptions(status)).toEqual(expected);
    });
  });

  describe('setDoctorStatusOptions()', () => {
    it.each([
      ['Pending', ['Confirmed']],
      ['Confirmed', ['Completed', 'Cancelled']],
      ['Completed', []],
      ['Cancelled', []],
      ['Unknown', []],
    ])('from %s should offer %j', (status, expected) => {
      expect(service.setDoctorStatusOptions(status)).toEqual(expected);
    });
  });

  describe('setAdminStatusOptions()', () => {
    it.each([
      ['Pending', ['Confirmed', 'Cancelled']],
      ['Confirmed', ['Completed', 'Cancelled']],
      ['Completed', []],
      ['Cancelled', []],
      ['Unknown', []],
    ])('from %s should offer %j', (status, expected) => {
      expect(service.setAdminStatusOptions(status)).toEqual(expected);
    });
  });

  describe('getStatusDropdownOptions()', () => {
    it('should use the patient rules for a Patient', () => {
      const spy = vi.spyOn(service, 'setPatientStatusOptions');

      const result = service.getStatusDropdownOptions(UserRole.Patient, 'Pending');

      expect(spy).toHaveBeenCalledWith('Pending');
      expect(result).toEqual(['Cancelled']);
    });

    it('should use the doctor rules for a Doctor', () => {
      const spy = vi.spyOn(service, 'setDoctorStatusOptions');

      const result = service.getStatusDropdownOptions(UserRole.Doctor, 'Pending');

      expect(spy).toHaveBeenCalledWith('Pending');
      expect(result).toEqual(['Confirmed']);
    });

    it('should use the admin rules for an Admin', () => {
      const spy = vi.spyOn(service, 'setAdminStatusOptions');

      const result = service.getStatusDropdownOptions('Admin', 'Pending');

      expect(spy).toHaveBeenCalledWith('Pending');
      expect(result).toEqual(['Confirmed', 'Cancelled']);
    });

    it('should return no options for any role once the appointment is closed', () => {
      for (const role of [UserRole.Patient, UserRole.Doctor, 'Admin']) {
        expect(service.getStatusDropdownOptions(role, 'Completed')).toEqual([]);
        expect(service.getStatusDropdownOptions(role, 'Cancelled')).toEqual([]);
      }
    });
  });
});
