import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { DoctorPatientResponse } from '../../../../core/models/doctor-patient-response.model';
import { PatientResponse } from '../../../../core/models/patient-response.model';
import { AuthService } from '../../../auth/services/auth.service';
import { PatientService } from '../../services/patient.service';
import { PatientsListComponent } from './patients-list.component';
import { doctorPatientColumns, patientColumns } from './patient-list-columns';

describe('PatientsListComponent', () => {
  let component: PatientsListComponent;

  let patientService: { getAll: Mock; getPatientsByDoctor: Mock };
  let authService: { getRole: Mock; getAuth: Mock };

  const allPatients = [{ id: 1 }, { id: 2 }] as PatientResponse[];
  const doctorPatients = [{ patientProfileId: 3 }] as DoctorPatientResponse[];

  async function setup(
    role: string,
    auth: { doctorProfileId?: number } | null = { doctorProfileId: 12 },
    failing: 'getAll' | 'getPatientsByDoctor' | null = null,
  ) {
    const failure = () => throwError(() => new Error('boom'));
    patientService = {
      getAll: vi.fn().mockReturnValue(failing === 'getAll' ? failure() : of(allPatients)),
      getPatientsByDoctor: vi
        .fn()
        .mockReturnValue(failing === 'getPatientsByDoctor' ? failure() : of(doctorPatients)),
    };
    authService = {
      getRole: vi.fn().mockReturnValue(role),
      getAuth: vi.fn().mockReturnValue(auth),
    };

    TestBed.overrideComponent(PatientsListComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [
        { provide: PatientService, useValue: patientService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('as a Doctor', () => {
    it('should create and flag itself as a doctor view', async () => {
      await setup('Doctor');

      expect(component).toBeTruthy();
      expect(component.isDoctor).toBe(true);
    });

    it("should load only the doctor's own patients using the doctor profile id", async () => {
      await setup('Doctor', { doctorProfileId: 12 });

      expect(authService.getAuth).toHaveBeenCalled();
      expect(patientService.getPatientsByDoctor).toHaveBeenCalledTimes(1);
      expect(patientService.getPatientsByDoctor).toHaveBeenCalledWith(12);
      expect(patientService.getAll).not.toHaveBeenCalled();
    });

    it('should populate doctorPatients and leave patients empty', async () => {
      await setup('Doctor');

      expect(component.doctorPatients()).toEqual(doctorPatients);
      expect(component.patients()).toEqual([]);
    });

    it('should call the service with undefined when there is no auth profile', async () => {
      await setup('Doctor', null);

      expect(patientService.getPatientsByDoctor).toHaveBeenCalledWith(undefined);
    });
  });

  describe('as an Admin', () => {
    it('should not flag itself as a doctor view', async () => {
      await setup('Admin');

      expect(component.isDoctor).toBe(false);
    });

    it('should load all patients', async () => {
      await setup('Admin');

      expect(patientService.getAll).toHaveBeenCalledTimes(1);
      expect(patientService.getPatientsByDoctor).not.toHaveBeenCalled();
      expect(authService.getAuth).not.toHaveBeenCalled();
    });

    it('should populate patients and leave doctorPatients empty', async () => {
      await setup('Admin');

      expect(component.patients()).toEqual(allPatients);
      expect(component.doctorPatients()).toEqual([]);
    });
  });

  describe('as any other role', () => {
    it.each(['Patient', ''])(
      'should fall back to loading all patients for role "%s"',
      async (role) => {
        await setup(role);

        expect(component.isDoctor).toBe(false);
        expect(patientService.getAll).toHaveBeenCalledTimes(1);
        expect(patientService.getPatientsByDoctor).not.toHaveBeenCalled();
        expect(component.patients()).toEqual(allPatients);
      },
    );
  });

  describe('error handling', () => {
    it('should keep patients empty when loading all patients fails', async () => {
      await expect(setup('Admin', null, 'getAll')).resolves.toBeUndefined();

      expect(patientService.getAll).toHaveBeenCalledTimes(1);
      expect(component.patients()).toEqual([]);
    });

    it('should keep doctorPatients empty when loading the doctor patients fails', async () => {
      await expect(
        setup('Doctor', { doctorProfileId: 12 }, 'getPatientsByDoctor'),
      ).resolves.toBeUndefined();

      expect(patientService.getPatientsByDoctor).toHaveBeenCalledTimes(1);
      expect(component.doctorPatients()).toEqual([]);
    });
  });

  describe('columns', () => {
    it('should expose the column definitions used by the grid', async () => {
      await setup('Admin');

      expect(component.patientColumns).toBe(patientColumns);
      expect(component.doctorPatientColumns).toBe(doctorPatientColumns);
    });
  });
});
