import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from './error-handler.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorResponse } from '../models/error.model';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let form: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService],
    });

    service = TestBed.inject(ErrorHandlerService);
    form = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply form errors', () => {
    const error: ErrorResponse = {
      statusCode: 422,
      traceId: 'A123',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          target: 'email',
        },
        {
          code: 'VALIDATION_ERROR',
          message: 'Password too short',
          target: 'password',
        },
      ],
    };

    service.applyFormErrors(form, error);
    expect(form.get('email')?.errors).toEqual({ serverError: ['Invalid email format'] });
    expect(form.get('password')?.errors).toEqual({ serverError: ['Password too short'] });
  });

  it('should skip errors where target does not match any control', () => {
    const error: ErrorResponse = {
      statusCode: 422,
      traceId: 'A123',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid username',
          target: 'username',
        },
      ],
    };

    service.applyFormErrors(form, error);
    expect(form.touched).toBe(false);
  });

  it('should skip errors when there is no target', () => {
    const error: ErrorResponse = {
      statusCode: 422,
      traceId: 'A123',
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid username',
        },
      ],
    };

    service.applyFormErrors(form, error);
    expect(form.get('email')?.errors).toBeNull();
    expect(form.get('password')?.errors).toBeNull();
  });
});
