import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { DoctorPatientResponse } from '../../../../core/models/doctor-patient-response.model';
import { PatientResponse } from '../../../../core/models/patient-response.model';
import { AuthService } from '../../../auth/services/auth.service';
import { PatientService } from '../../services/patient.service';
import { PatientsListComponent } from './patients-list.component';
import { doctorPatientColumns, patientColumns } from './patient-list-columns';

type TestUser = { role: string; doctorProfileId?: number } | null;

describe('PatientsListComponent', () => {
  let component: PatientsListComponent;
  let patientService: { getAll: Mock; getPatientsByDoctor: Mock };

  const allPatients = [{ id: 1 }, { id: 2 }] as unknown as PatientResponse[];
  const doctorPatients = [{ id: 10 }, { id: 11 }] as unknown as DoctorPatientResponse[];

  async function setup(
    user: TestUser,
    results: {
      getAll?: Observable<PatientResponse[]>;
      getPatientsByDoctor?: Observable<DoctorPatientResponse[]>;
    } = {},
  ) {
    patientService = {
      getAll: vi.fn().mockReturnValue(results.getAll ?? of(allPatients)),
      getPatientsByDoctor: vi
        .fn()
        .mockReturnValue(results.getPatientsByDoctor ?? of(doctorPatients)),
    };

    TestBed.overrideComponent(PatientsListComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [PatientsListComponent],
      providers: [
        { provide: PatientService, useValue: patientService },
        { provide: AuthService, useValue: { user: signal<TestUser>(user) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('as a Doctor', () => {
    const doctor = { role: 'Doctor', doctorProfileId: 7 };

    it('should create', async () => {
      await setup(doctor);

      expect(component).toBeTruthy();
    });

    it('should be flagged as a doctor', async () => {
      await setup(doctor);

      expect(component.isDoctor).toBe(true);
    });

    it("should load the doctor's patients using the doctor profile id", async () => {
      await setup(doctor);

      expect(patientService.getPatientsByDoctor).toHaveBeenCalledTimes(1);
      expect(patientService.getPatientsByDoctor).toHaveBeenCalledWith(7);
    });

    it('should not load all patients', async () => {
      await setup(doctor);

      expect(patientService.getAll).not.toHaveBeenCalled();
    });

    it('should store the response in doctorPatients only', async () => {
      await setup(doctor);

      expect(component.doctorPatients()).toEqual(doctorPatients);
      expect(component.patients()).toEqual([]);
    });

    it('should leave doctorPatients empty when the request fails', async () => {
      await setup(doctor, { getPatientsByDoctor: throwError(() => new Error('boom')) });

      expect(component.doctorPatients()).toEqual([]);
      expect(component.patients()).toEqual([]);
    });
  });

  describe.each(['Admin', 'Patient'])('as a %s', (role) => {
    it('should not be flagged as a doctor', async () => {
      await setup({ role });

      expect(component.isDoctor).toBe(false);
    });

    it('should load all patients', async () => {
      await setup({ role });

      expect(patientService.getAll).toHaveBeenCalledTimes(1);
      expect(patientService.getPatientsByDoctor).not.toHaveBeenCalled();
    });

    it('should store the response in patients only', async () => {
      await setup({ role });

      expect(component.patients()).toEqual(allPatients);
      expect(component.doctorPatients()).toEqual([]);
    });

    it('should leave patients empty when the request fails', async () => {
      await setup({ role }, { getAll: throwError(() => new Error('boom')) });

      expect(component.patients()).toEqual([]);
      expect(component.doctorPatients()).toEqual([]);
    });
  });

  describe('with no signed-in user', () => {
    it('should not be flagged as a doctor and should load all patients', async () => {
      await setup(null);

      expect(component.isDoctor).toBe(false);
      expect(patientService.getAll).toHaveBeenCalledTimes(1);
      expect(patientService.getPatientsByDoctor).not.toHaveBeenCalled();
      expect(component.patients()).toEqual(allPatients);
    });
  });

  describe('columns', () => {
    it('should expose the patient columns', async () => {
      await setup({ role: 'Admin' });

      expect(component.patientColumns).toBe(patientColumns);
    });

    it('should expose the doctor-patient columns', async () => {
      await setup({ role: 'Doctor', doctorProfileId: 7 });

      expect(component.doctorPatientColumns).toBe(doctorPatientColumns);
    });
  });
});
