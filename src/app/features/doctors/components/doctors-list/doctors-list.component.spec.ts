import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsListComponent } from './doctors-list.component';
import { DoctorService } from '../../services/doctor.service';
import { SpecializationService } from '../../../../core/services/specialization.service';
import { filter, of } from 'rxjs';
import { DoctorResponse } from '../../../../core/models/doctor-response.model';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';

describe('DoctorsListComponent', () => {
  let component: DoctorsListComponent;
  let fixture: ComponentFixture<DoctorsListComponent>;
  let mockSpecialization: SpecializationResponse[] = [
    {
      id: 1,
      name: 'Pediatrics',
    },
    {
      id: 2,
      name: 'Hematology',
    },
  ];
  let mockDoctorResponse: DoctorResponse[] = [
    {
      id: 1,
      name: 'Doctor 1',
      email: 'doctor1@example.com',
      userId: 1,
      consultationFee: 1,
      licenseNumber: '123-ABC',
      specialization: mockSpecialization[0],
    },
    {
      id: 2,
      name: 'Doctor 2',
      email: 'doctor2@example.com',
      userId: 2,
      consultationFee: 1,
      licenseNumber: '123-DEF',
      specialization: mockSpecialization[1],
    },
  ];
  let doctorServiceMock = {
    getAll: vi.fn().mockReturnValue(of(mockDoctorResponse)),
  };
  let specializationServiceMock = {
    getAll: vi.fn().mockReturnValue(of([mockSpecialization])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorsListComponent],
      providers: [
        {
          provide: DoctorService,
          useValue: doctorServiceMock,
        },
        {
          provide: SpecializationService,
          useValue: specializationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get doctors when specialization changes', () => {
    const filteredDoctors = mockDoctorResponse[1];
    doctorServiceMock.getAll.mockReturnValue(of([filteredDoctors]));
    component.selectedSpecialization.set(2);
    fixture.detectChanges();
    expect(doctorServiceMock.getAll).toHaveBeenCalled();
    expect(component.doctors()).toEqual([filteredDoctors]);
  });
});
