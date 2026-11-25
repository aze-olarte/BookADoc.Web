import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ErrorResponse } from '../../../../core/models/error.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  let authService: { login: Mock; storeAuth: Mock };
  let errorHandlerService: { applyFormErrors: Mock };
  let router: { navigate: Mock };

  const authResponse = { token: 'jwt-token' };
  const makeApiError = (statusCode: number) => ({ statusCode }) as ErrorResponse;

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockReturnValue(of(authResponse)),
      storeAuth: vi.fn(),
    };
    errorHandlerService = { applyFormErrors: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.overrideComponent(LoginComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ErrorHandlerService, useValue: errorHandlerService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(email = 'jane@example.com', password = 'Secret123!') {
    component.fg.setValue({ email, password });
  }

  describe('initial state', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with empty email and password', () => {
      expect(component.fg.getRawValue()).toEqual({ email: '', password: '' });
    });

    it('should start with an invalid form', () => {
      expect(component.fg.invalid).toBe(true);
    });

    it('should expose form controls through the f getter', () => {
      expect(component.f).toBe(component.fg.controls);
    });
  });

  describe('validation', () => {
    it('should require an email', () => {
      expect(component.f.email.hasError('required')).toBe(true);
    });

    it.each(['not-an-email', '@example.com', 'spaces in@example.com'])(
      'should reject the malformed email "%s"',
      (email) => {
        component.f.email.setValue(email);

        expect(component.f.email.hasError('email')).toBe(true);
      },
    );

    it('should accept a well-formed email', () => {
      component.f.email.setValue('jane@example.com');

      expect(component.f.email.valid).toBe(true);
    });

    it('should require a password', () => {
      expect(component.f.password.hasError('required')).toBe(true);
    });

    it('should be valid once both fields are filled correctly', () => {
      fillValidForm();

      expect(component.fg.valid).toBe(true);
    });

    it('should be invalid with a valid email but no password', () => {
      component.f.email.setValue('jane@example.com');

      expect(component.fg.invalid).toBe(true);
    });
  });

  describe('submit() with an invalid form', () => {
    it('should not call the API, store auth or navigate', () => {
      component.submit();

      expect(authService.login).not.toHaveBeenCalled();
      expect(authService.storeAuth).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched so errors are shown', () => {
      expect(component.f.email.touched).toBe(false);
      expect(component.f.password.touched).toBe(false);

      component.submit();

      expect(component.f.email.touched).toBe(true);
      expect(component.f.password.touched).toBe(true);
    });
  });

  describe('submit() with a valid form', () => {
    beforeEach(() => fillValidForm('jane@example.com', 'Secret123!'));

    it('should log in with the entered credentials', () => {
      component.submit();

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'Secret123!',
      });
    });

    it('should navigate to the dashboard on success', () => {
      component.submit();

      expect(router.navigate).toHaveBeenCalledWith(['/portal/dashboard']);
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
      authService.login.mockReturnValue(throwError(() => apiError));

      component.submit();

      expect(errorHandlerService.applyFormErrors).toHaveBeenCalledWith(component.fg, apiError);
    });

    it('should not store auth or navigate after a 422', () => {
      authService.login.mockReturnValue(throwError(() => makeApiError(422)));

      component.submit();

      expect(authService.storeAuth).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it.each([400, 401, 403, 500])(
      'should not apply form errors, store auth or navigate for a %s',
      (statusCode) => {
        authService.login.mockReturnValue(throwError(() => makeApiError(statusCode)));

        expect(() => component.submit()).not.toThrow();

        expect(errorHandlerService.applyFormErrors).not.toHaveBeenCalled();
        expect(authService.storeAuth).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      },
    );
  });
});
