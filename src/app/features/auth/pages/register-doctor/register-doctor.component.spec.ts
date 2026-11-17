import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ErrorResponse } from '../../../../core/models/error.model';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { AuthService } from '../../services/auth.service';
import { RegisterDoctorComponent } from './register-doctor.component';

describe('RegisterDoctorComponent', () => {
  let fixture: ComponentFixture<RegisterDoctorComponent>;
  let component: RegisterDoctorComponent;

  let authService: { register: Mock; storeAuth: Mock };
  let errorHandlerService: { applyFormErrors: Mock };
  let toastService: { success: Mock };
  let router: { navigate: Mock };
  let specializationService: { getAll: Mock };

  const specializations = [
    { id: 3, name: 'Cardiology' },
    { id: 4, name: 'Dermatology' },
  ];
  const authResponse = { token: 'jwt-token' };
  const makeApiError = (statusCode: number) => ({ statusCode }) as ErrorResponse;

  const validValues = {
    name: 'Dr. Jane Doe',
    email: 'jane@example.com',
    password: 'Secret123!',
    confirmPassword: 'Secret123!',
    licenseNumber: 'LIC-12345',
    specializationId: 3 as number | null,
    consultationFee: 500,
    bio: 'Cardiologist with 10 years of experience',
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn().mockReturnValue(of(authResponse)),
      storeAuth: vi.fn(),
    };
    errorHandlerService = { applyFormErrors: vi.fn() };
    toastService = { success: vi.fn() };
    router = { navigate: vi.fn() };
    specializationService = { getAll: vi.fn().mockReturnValue(of(specializations)) };

    TestBed.overrideComponent(RegisterDoctorComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [RegisterDoctorComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ErrorHandlerService, useValue: errorHandlerService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
        { provide: SpecializationService, useValue: specializationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(overrides: Partial<typeof validValues> = {}) {
    component.fg.setValue({ ...validValues, ...overrides });
  }

  describe('initial state', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the specialization options on creation', () => {
      expect(specializationService.getAll).toHaveBeenCalledTimes(1);
      expect(component.specializationOptions()).toEqual(specializations);
    });

    it('should start with the expected default values', () => {
      expect(component.fg.getRawValue()).toEqual({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        licenseNumber: '',
        specializationId: null,
        consultationFee: 0,
        bio: '',
      });
    });

    it('should start with an invalid form', () => {
      expect(component.fg.invalid).toBe(true);
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });
  });

  describe('validation', () => {
    it('should be valid when every field is filled correctly', () => {
      fillValidForm();

      expect(component.fg.valid).toBe(true);
    });

    it.each(['name', 'email', 'password', 'confirmPassword', 'licenseNumber'] as const)(
      'should require %s',
      (field) => {
        fillValidForm({ [field]: '' });

        expect(component.f[field].hasError('required')).toBe(true);
        expect(component.fg.invalid).toBe(true);
      },
    );

    it('should require a specialization', () => {
      fillValidForm({ specializationId: null });

      expect(component.f.specializationId.hasError('required')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should reject a malformed email', () => {
      fillValidForm({ email: 'not-an-email' });

      expect(component.f.email.hasError('email')).toBe(true);
      expect(component.fg.invalid).toBe(true);
    });

    it('should treat bio as optional', () => {
      fillValidForm({ bio: '' });

      expect(component.f.bio.valid).toBe(true);
      expect(component.fg.valid).toBe(true);
    });

    describe('consultationFee', () => {
      it('should reject the default of 0', () => {
        expect(component.f.consultationFee.hasError('min')).toBe(true);
      });

      it('should reject a negative fee', () => {
        component.f.consultationFee.setValue(-5);

        expect(component.f.consultationFee.hasError('min')).toBe(true);
      });

      it('should accept the smallest allowed fee of 0.01', () => {
        component.f.consultationFee.setValue(0.01);

        expect(component.f.consultationFee.valid).toBe(true);
      });

      it('should accept a normal fee', () => {
        component.f.consultationFee.setValue(500);

        expect(component.f.consultationFee.valid).toBe(true);
      });
    });

    describe('password confirmation', () => {
      it('should be invalid when the passwords do not match', () => {
        fillValidForm({ confirmPassword: 'Different456!' });

        expect(component.fg.invalid).toBe(true);
      });

      it('should become valid once the passwords match', () => {
        fillValidForm({ confirmPassword: 'Different456!' });

        component.f.confirmPassword.setValue(validValues.password);

        expect(component.fg.valid).toBe(true);
      });

      it('should become invalid again if the password changes after confirming', () => {
        fillValidForm();

        component.f.password.setValue('ChangedLater789!');

        expect(component.fg.invalid).toBe(true);
      });
    });
  });

  describe('submit() with an invalid form', () => {
    it('should not call the API, show a toast, store auth or navigate', () => {
      component.submit();

      expect(authService.register).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
      expect(authService.storeAuth).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched so errors are shown', () => {
      expect(component.f.name.touched).toBe(false);
      expect(component.f.licenseNumber.touched).toBe(false);

      component.submit();

      expect(component.f.name.touched).toBe(true);
      expect(component.f.licenseNumber.touched).toBe(true);
      expect(component.f.specializationId.touched).toBe(true);
    });

    it('should not submit when the passwords do not match', () => {
      fillValidForm({ confirmPassword: 'Different456!' });

      component.submit();

      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('submit() with a valid form', () => {
    beforeEach(() => fillValidForm());

    it('should register with the form values and the Doctor role', () => {
      component.submit();

      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith({
        ...validValues,
        role: UserRole.Doctor,
        specializationId: 3,
      });
    });

    it('should always send the Doctor role, whatever the form contains', () => {
      component.submit();

      expect(authService.register.mock.calls[0][0].role).toBe(UserRole.Doctor);
    });

    it('should show the success toast', () => {
      component.submit();

      expect(toastService.success).toHaveBeenCalledWith('You have successfully registered!');
    });

    it('should store the auth response on success', () => {
      component.submit();

      expect(authService.storeAuth).toHaveBeenCalledWith(authResponse);
    });

    it('should navigate to the dashboard on success', () => {
      component.submit();

      expect(router.navigate).toHaveBeenCalledWith(['/portal/dashboard']);
    });

    it('should store the auth before navigating', () => {
      component.submit();

      const storeOrder = authService.storeAuth.mock.invocationCallOrder[0];
      const navigateOrder = router.navigate.mock.invocationCallOrder[0];
      expect(storeOrder).toBeLessThan(navigateOrder);
    });

    it('should not apply form errors on success', () => {
      component.submit();

      expect(errorHandlerService.applyFormErrors).not.toHaveBeenCalled();
    });
  });

  describe('submit() when the API returns an error', () => {
    beforeEach(() => fillValidForm());

    it('should map a 422 validation error onto the form', () => {
      const apiError = makeApiError(422);
      authService.register.mockReturnValue(throwError(() => apiError));

      component.submit();

      expect(errorHandlerService.applyFormErrors).toHaveBeenCalledWith(component.fg, apiError);
    });

    it('should not toast, store auth or navigate after a 422', () => {
      authService.register.mockReturnValue(throwError(() => makeApiError(422)));

      component.submit();

      expect(toastService.success).not.toHaveBeenCalled();
      expect(authService.storeAuth).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it.each([400, 409, 500])(
      'should do nothing visible in the component for a %s',
      (statusCode) => {
        authService.register.mockReturnValue(throwError(() => makeApiError(statusCode)));

        expect(() => component.submit()).not.toThrow();

        expect(errorHandlerService.applyFormErrors).not.toHaveBeenCalled();
        expect(toastService.success).not.toHaveBeenCalled();
        expect(authService.storeAuth).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      },
    );
  });
});
