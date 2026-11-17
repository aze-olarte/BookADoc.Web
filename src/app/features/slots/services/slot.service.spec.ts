import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { SlotRequest } from '../../../core/models/slot-request.model';
import { SlotResponse } from '../../../core/models/slot-response.model';
import { SlotService } from './slot.service';

describe('SlotService', () => {
  let service: SlotService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/doctor`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SlotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getSlots()', () => {
    it('should GET the doctor slots for the date range, formatted as yyyy-MM-dd', () => {
      const slots = [{ id: 1 }] as unknown as SlotResponse[];
      let result: SlotResponse[] | undefined;

      service
        .getSlots(10, new Date(2024, 0, 15), new Date(2024, 0, 21))
        .subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/10/slots?fromDate=2024-01-15&toDate=2024-01-21`);
      expect(req.request.method).toBe('GET');
      req.flush(slots);
      expect(result).toEqual(slots);
    });

    it('should send no query string when no dates are given', () => {
      service.getSlots(10).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/10/slots`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('addSlot()', () => {
    it('should POST the slot to the doctor slots endpoint', () => {
      const payload: SlotRequest = {
        id: 0,
        date: '2024-01-15',
        startTime: '09:00:00',
        endTime: '09:30:00',
        isBooked: false,
      };
      let result: SlotRequest | undefined;

      service.addSlot(7, payload).subscribe((r) => (result = r));

      const req = httpMock.expectOne(`${apiUrl}/7/slots`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(payload);
      expect(result).toEqual(payload);
    });
  });

  describe('deleteSlot()', () => {
    it('should DELETE the slot of the doctor', () => {
      service.deleteSlot(7, 5).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/7/slots/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
