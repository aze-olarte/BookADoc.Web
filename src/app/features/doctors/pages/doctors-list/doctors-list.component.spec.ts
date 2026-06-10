import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { DoctorSummaryResponse } from '../../../../core/models/doctor-summary-response.model';
import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { DoctorService } from '../../services/doctor.service';
import { DoctorsListComponent } from './doctors-list.component';
import { provideRouter } from '@angular/router';

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
  let mockDoctorResponse: DoctorSummaryResponse[] = [
    {
      id: 1,
      name: 'Doctor 1',
      specialization: mockSpecialization[0],
    },
    {
      id: 2,
      name: 'Doctor 2',
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
        provideRouter([]),
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
