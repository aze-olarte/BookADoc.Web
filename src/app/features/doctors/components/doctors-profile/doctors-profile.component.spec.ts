import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsProfileComponent } from './doctors-profile.component';
import { provideRouter, Router } from '@angular/router';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { DoctorResponse } from '../../../../core/models/doctor-response.model';
import { of } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';

describe('DoctorsProfileComponent', () => {
  let component: DoctorsProfileComponent;
  let fixture: ComponentFixture<DoctorsProfileComponent>;
  let router: Router;
  let mockSpecialization: SpecializationResponse = {
    id: 1,
    name: 'Pediatrics',
  };
  let mockDoctorResponse: DoctorResponse = {
    id: 1,
    name: 'Doctor 1',
    specialization: mockSpecialization,
    userId: 1,
    email: 'doctor1@example.com',
    consultationFee: 4,
    bio: '',
    licenseNumber: 'ABC-123',
  };
  let doctorServiceMock = {
    get: vi.fn().mockReturnValue(of(mockDoctorResponse)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsProfileComponent],
      providers: [
        provideRouter([]),
        {
          provide: DoctorService,
          useValue: doctorServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsProfileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 1);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
