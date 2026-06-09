import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { AppointmentService } from './appointment.service';
import { AppointmentStatus } from '../../../core/models/appointment-status.enum';
import { UserRole } from '../../../core/models/user-role.enum';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/appointment`;

  const mockAppointment = {
    id: 1,
    slotId: 10,
    userId: 5,
    patientName: 'Alice',
    doctorName: 'Dr. Smith',
    specialization: 'Cardiology',
    date: new Date('2024-01-01'),
    startTime: new Date('2024-01-01T09:00:00'),
    endTime: new Date('2024-01-01T09:30:00'),
    status: AppointmentStatus.Pending,
    bookedAt: new Date('2023-12-01T10:00:00'),
  };

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

  describe('getAll', () => {
    it('makes a GET request to the correct url', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });

    it('returns the response body', () => {
      let result: any;
      service.getAll().subscribe((data) => (result = data));
      httpMock.expectOne(apiUrl).flush([mockAppointment]);
      expect(result).toEqual([mockAppointment]);
    });
  });

  describe('getUserAppointments', () => {
    it('makes a GET request to /mine', () => {
      service.getUserAppointments().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/mine`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });
  });

  describe('get', () => {
    it('makes a GET request to the correct url with the id', () => {
      service.get(1).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });
  });

  describe('addAppointment', () => {
    it('makes a POST request with the payload', () => {
      const payload = { slotId: 10, reason: 'Checkup' };
      service.addAppointment(payload).subscribe();
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockAppointment);
    });
  });

  describe('patchAppointmentStatus', () => {
    it('makes a PATCH request to the correct url with the payload', () => {
      const payload = { status: 'Confirmed' };
      service.patchAppointmentStatus(1, payload).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('addNotes', () => {
    it('makes a PATCH request to the correct url with the payload', () => {
      const payload = { notes: 'Patient is recovering well.' };
      service.addNotes(1, payload).subscribe();
      const req = httpMock.expectOne(`${apiUrl}/1/notes`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('getStatusDropdownOptions', () => {
    it('delegates to patient options for Patient role', () => {
      const result = service.getStatusDropdownOptions(UserRole.Patient, 'Pending');
      expect(result).toEqual(['Cancelled']);
    });

    it('delegates to doctor options for Doctor role', () => {
      const result = service.getStatusDropdownOptions(UserRole.Doctor, 'Pending');
      expect(result).toEqual(['Confirmed']);
    });

    it('delegates to admin options for any other role', () => {
      const result = service.getStatusDropdownOptions(UserRole.Admin, 'Pending');
      expect(result).toEqual(['Confirmed', 'Cancelled']);
    });
  });

  describe('setPatientStatusOptions', () => {
    it('returns Cancelled for Pending status', () => {
      expect(service.setPatientStatusOptions('Pending')).toEqual(['Cancelled']);
    });

    it('returns Cancelled for Confirmed status', () => {
      expect(service.setPatientStatusOptions('Confirmed')).toEqual(['Cancelled']);
    });

    it('returns empty array for other statuses', () => {
      expect(service.setPatientStatusOptions('Completed')).toEqual([]);
    });
  });

  describe('setDoctorStatusOptions', () => {
    it('returns Confirmed for Pending status', () => {
      expect(service.setDoctorStatusOptions('Pending')).toEqual(['Confirmed']);
    });

    it('returns Completed and Cancelled for Confirmed status', () => {
      expect(service.setDoctorStatusOptions('Confirmed')).toEqual(['Completed', 'Cancelled']);
    });

    it('returns empty array for other statuses', () => {
      expect(service.setDoctorStatusOptions('Completed')).toEqual([]);
    });
  });

  describe('setAdminStatusOptions', () => {
    it('returns Confirmed and Cancelled for Pending status', () => {
      expect(service.setAdminStatusOptions('Pending')).toEqual(['Confirmed', 'Cancelled']);
    });

    it('returns Completed and Cancelled for Confirmed status', () => {
      expect(service.setAdminStatusOptions('Confirmed')).toEqual(['Completed', 'Cancelled']);
    });

    it('returns empty array for other statuses', () => {
      expect(service.setAdminStatusOptions('Completed')).toEqual([]);
    });
  });
});
