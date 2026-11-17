import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { DoctorSummaryResponse } from '../../../../core/models/doctor-summary-response.model';
import { AuthService } from '../../../auth/services/auth.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { DoctorService } from '../../services/doctor.service';
import { DoctorsListComponent } from './doctors-list.component';
import { columns } from './doctors-list-columns';

describe('DoctorsListComponent', () => {
  let fixture: ComponentFixture<DoctorsListComponent>;
  let component: DoctorsListComponent;

  let doctorService: { getAll: Mock };
  let specializationService: { getAll: Mock };
  let authService: { getAuth: Mock };
  let router: { navigate: Mock };

  const specializations = [
    { id: 1, name: 'Cardiology' },
    { id: 2, name: 'Dermatology' },
  ];
  const makeDoctor = (id: number) => ({ id }) as DoctorSummaryResponse;
  const allDoctors = [makeDoctor(10), makeDoctor(11)];

  async function flush() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function selectSpecialization(id: number) {
    component.selectedSpecialization.set(id);
    await flush();
  }

  async function setup(loggedIn = false) {
    doctorService = { getAll: vi.fn().mockReturnValue(of(allDoctors)) };
    specializationService = { getAll: vi.fn().mockReturnValue(of(specializations)) };
    authService = { getAuth: vi.fn().mockReturnValue(loggedIn ? { name: 'Jane' } : null) };
    router = { navigate: vi.fn() };

    TestBed.overrideComponent(DoctorsListComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [DoctorsListComponent],
      providers: [
        { provide: DoctorService, useValue: doctorService },
        { provide: SpecializationService, useValue: specializationService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsListComponent);
    component = fixture.componentInstance;
    await flush();
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the specialization options', () => {
      expect(specializationService.getAll).toHaveBeenCalledTimes(1);
      expect(component.specializationOptions()).toEqual(specializations);
    });

    it('should start with no specialization filter (0)', () => {
      expect(component.selectedSpecialization()).toBe(0);
    });

    it('should load all doctors on first render using the 0 filter', () => {
      expect(doctorService.getAll).toHaveBeenCalledTimes(1);
      expect(doctorService.getAll).toHaveBeenCalledWith(0);
      expect(component.doctors()).toEqual(allDoctors);
    });

    it('should expose the shared column definitions', () => {
      expect(component.columnDefs).toBe(columns);
    });

    it('should define a single view action', () => {
      expect(component.actions).toEqual([{ type: 'view', label: 'View', icon: 'visibility' }]);
    });
  });

  describe('filtering by specialization', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should fetch the doctors of the selected specialization', async () => {
      const cardiologists = [makeDoctor(20)];
      doctorService.getAll.mockReturnValue(of(cardiologists));

      await selectSpecialization(1);

      expect(doctorService.getAll).toHaveBeenLastCalledWith(1);
      expect(component.doctors()).toEqual(cardiologists);
    });

    it('should go back to all doctors when the filter is reset to 0', async () => {
      doctorService.getAll.mockReturnValue(of([makeDoctor(20)]));
      await selectSpecialization(1);
      doctorService.getAll.mockReturnValue(of(allDoctors));

      await selectSpecialization(0);

      expect(doctorService.getAll).toHaveBeenLastCalledWith(0);
      expect(component.doctors()).toEqual(allDoctors);
    });

    it('should not refetch when the same specialization is selected again', async () => {
      await selectSpecialization(1);
      doctorService.getAll.mockClear();

      await selectSpecialization(1);

      expect(doctorService.getAll).not.toHaveBeenCalled();
    });

    it('should ignore a stale response from the previous filter (switchMap)', async () => {
      const first$ = new Subject<DoctorSummaryResponse[]>();
      const second$ = new Subject<DoctorSummaryResponse[]>();
      doctorService.getAll.mockReturnValueOnce(first$).mockReturnValueOnce(second$);

      await selectSpecialization(1);
      await selectSpecialization(2);

      first$.next([makeDoctor(1)]);
      expect(component.doctors()).toEqual(allDoctors);

      second$.next([makeDoctor(2)]);
      expect(component.doctors()).toEqual([makeDoctor(2)]);
    });
  });

  describe('onActionTriggered()', () => {
    beforeEach(async () => {
      await setup();
    });

    it('should route "view" to onView with the row id', () => {
      const spy = vi.spyOn(component, 'onView').mockImplementation(() => {});

      component.onActionTriggered({ action: 'view', row: makeDoctor(15) });

      expect(spy).toHaveBeenCalledWith(15);
    });

    it('should do nothing for an unknown action', () => {
      const spy = vi.spyOn(component, 'onView').mockImplementation(() => {});

      component.onActionTriggered({ action: 'delete', row: makeDoctor(15) });

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onView()', () => {
    it('should open the portal doctor page when the user is logged in', async () => {
      await setup(true);

      component.onView(15);

      expect(router.navigate).toHaveBeenCalledWith(['/portal/doctors', 15]);
    });

    it('should open the public doctor page when the user is not logged in', async () => {
      await setup(false);

      component.onView(15);

      expect(router.navigate).toHaveBeenCalledWith(['/doctors', 15]);
    });

    it('should check the auth state at click time, not at creation', async () => {
      await setup(false);
      authService.getAuth.mockReturnValue({ name: 'Jane' });

      component.onView(15);

      expect(router.navigate).toHaveBeenCalledWith(['/portal/doctors', 15]);
    });
  });
});
