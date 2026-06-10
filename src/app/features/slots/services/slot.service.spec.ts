import { TestBed } from '@angular/core/testing';

import { SlotService } from './slot.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('SlotService', () => {
  let service: SlotService;
  let httpMock: HttpTestingController;
  let apiUrl = `${environment.apiUrl}/doctor`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlotService, provideHttpClient, provideHttpClientTesting()],
    });
    service = TestBed.inject(SlotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get doctor slots with the date formatted as yyyy-MM-dd', () => {
    const date = new Date('2024-01-15');
    service.getSlots(10, date, date).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/10/slots?date=2024-01-15&date=2024-01-15`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
