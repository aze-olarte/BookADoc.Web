import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsCardComponent } from './doctors-card.component';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { DoctorResponse } from '../../../../core/models/doctor-response.model';
import { provideRouter, Router } from '@angular/router';

describe('DoctorsCardComponent', () => {
  let component: DoctorsCardComponent;
  let fixture: ComponentFixture<DoctorsCardComponent>;
  let router: Router;
  let mockSpecialization: SpecializationResponse = {
    id: 1,
    name: 'Pediatrics',
  };
  let mockDoctorResponse: DoctorResponse = {
    id: 1,
    name: 'Doctor',
    email: 'doctor@example.com',
    userId: 1,
    consultationFee: 1,
    licenseNumber: '123-ABC',
    specialization: mockSpecialization,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('doctor', mockDoctorResponse);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
