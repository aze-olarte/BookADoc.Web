import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsListComponent } from './patients-list.component';
import { PatientResponse } from '../../../../core/models/patient-response.model';
import { of, throwError } from 'rxjs';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../../../core/services/toast.service';

const mockPatients: PatientResponse[] = [
  { id: 1, name: 'John Doe', email: 'johndoe@example.com' },
  { id: 1, name: 'Mike Doe', email: 'mikedoe@example.com' },
];

const makePatientService = () => ({
  getAll: vi.fn().mockReturnValue(of(mockPatients)),
});

const makeToastService = () => ({
  success: vi.fn(),
  error: vi.fn(),
});

describe('PatientsListComponent', () => {
  let component: PatientsListComponent;
  let fixture: ComponentFixture<PatientsListComponent>;
  let patientService: ReturnType<typeof makePatientService>;
  let toastService: ReturnType<typeof makeToastService>;

  beforeEach(async () => {
    patientService = makePatientService();
    toastService = makeToastService();
    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [
        {
          provide: PatientService,
          useValue: patientService,
        },
        {
          provide: ToastService,
          useValue: toastService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads data on init', () => {
    expect(patientService.getAll).toHaveBeenCalledOnce();
    expect(component.data()).toEqual(mockPatients);
  });

  it('shows a toast error when getAll fails', () => {
    const err = new Error('network error');
    patientService.getAll.mockReturnValue(throwError(() => err));
    component.loadData();
    expect(toastService.error).toHaveBeenCalledWith(err);
  });
});
