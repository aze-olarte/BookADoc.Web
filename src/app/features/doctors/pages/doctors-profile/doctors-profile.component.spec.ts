import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AuthService } from '../../../auth/services/auth.service';
import { DoctorService } from '../../services/doctor.service';
import { DoctorsProfileComponent } from './doctors-profile.component';

describe('DoctorsProfileComponent', () => {
  let fixture: ComponentFixture<DoctorsProfileComponent>;
  let component: DoctorsProfileComponent;

  let doctorService: { get: Mock };
  let authService: { getAuth: Mock };

  const makeDoctor = (id: number) => ({ id, name: `Dr. ${id}` });

  async function createWithId(idValue: unknown, loggedIn = true) {
    authService = { getAuth: vi.fn().mockReturnValue(loggedIn ? { name: 'Jane' } : null) };

    TestBed.overrideComponent(DoctorsProfileComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [DoctorsProfileComponent],
      providers: [
        { provide: DoctorService, useValue: doctorService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsProfileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', idValue);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function changeId(idValue: unknown) {
    fixture.componentRef.setInput('id', idValue);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function respondWith(response$: Observable<unknown>) {
    doctorService.get.mockReturnValue(response$);
  }

  beforeEach(() => {
    doctorService = { get: vi.fn().mockReturnValue(of(makeDoctor(5))) };
  });

  it('should create', async () => {
    await createWithId(5);

    expect(component).toBeTruthy();
  });

  describe('id input', () => {
    it('should transform a string id (e.g. from a route param) into a number', async () => {
      await createWithId('5');

      expect(component.id()).toBe(5);
      expect(doctorService.get).toHaveBeenCalledWith(5);
    });

    it('should accept a numeric id as is', async () => {
      await createWithId(12);

      expect(component.id()).toBe(12);
      expect(doctorService.get).toHaveBeenCalledWith(12);
    });

    it('should pass NaN to the service when the id is not numeric', async () => {
      await createWithId('abc');

      expect(component.id()).toBeNaN();
      expect(doctorService.get).toHaveBeenCalledWith(NaN);
    });
  });

  describe('loading the doctor', () => {
    it('should be null while the request is pending', async () => {
      respondWith(new Subject());

      await createWithId(5);

      expect(doctorService.get).toHaveBeenCalledTimes(1);
      expect(component.doctor()).toBeNull();
    });

    it('should expose the doctor once the request resolves', async () => {
      const response$ = new Subject();
      respondWith(response$);
      await createWithId(5);

      response$.next(makeDoctor(5));

      expect(component.doctor()).toEqual(makeDoctor(5));
    });

    it('should fetch the doctor once on first render', async () => {
      await createWithId(5);

      expect(doctorService.get).toHaveBeenCalledTimes(1);
      expect(component.doctor()).toEqual(makeDoctor(5));
    });
  });

  describe('when the id changes', () => {
    it('should fetch the doctor for the new id', async () => {
      await createWithId(5);
      respondWith(of(makeDoctor(6)));

      await changeId(6);

      expect(doctorService.get).toHaveBeenCalledTimes(2);
      expect(doctorService.get).toHaveBeenLastCalledWith(6);
      expect(component.doctor()).toEqual(makeDoctor(6));
    });

    it('should not refetch when the same id is set again', async () => {
      await createWithId(5);

      await changeId(5);

      expect(doctorService.get).toHaveBeenCalledTimes(1);
    });

    it('should ignore a stale response from the previous id (switchMap)', async () => {
      const first$ = new Subject();
      const second$ = new Subject();
      doctorService.get.mockReturnValueOnce(first$).mockReturnValueOnce(second$);

      await createWithId(1);
      await changeId(2);

      first$.next(makeDoctor(1));
      expect(component.doctor()).toBeNull();

      second$.next(makeDoctor(2));
      expect(component.doctor()).toEqual(makeDoctor(2));
    });
  });

  describe('back link route', () => {
    it('should point to the portal doctors list when the user is logged in', async () => {
      await createWithId(5, true);

      expect(component.route).toBe('/portal/doctors');
    });

    it('should be an empty string when the user is not logged in', async () => {
      await createWithId(5, false);

      expect(component.route).toBe('');
    });

    it('should be decided once at creation, not on every change', async () => {
      await createWithId(5, true);
      authService.getAuth.mockReturnValue(null);

      await changeId(6);

      expect(component.route).toBe('/portal/doctors');
    });
  });
});
