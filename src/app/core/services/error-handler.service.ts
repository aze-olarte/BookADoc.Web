import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorResponse } from '../models/shared/error';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  applyFormErrors(form: FormGroup, error: ErrorResponse): void {
    error.errors.forEach((e) => {
      if (e.target) {
        const control = form.get(e.target);
        if (control) {
          control.setErrors({ serverError: e.message });
          control.markAsTouched();
        }
      }
    });
  }
}
