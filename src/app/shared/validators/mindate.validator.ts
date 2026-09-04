import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minDateValidator(minDate: Date, compareTime = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const input = new Date(control.value);

    const actual = compareTime
      ? input
      : new Date(input.getFullYear(), input.getMonth(), input.getDate());

    const minimum = compareTime
      ? minDate
      : new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

    return actual < minimum
      ? {
          minDate: {
            required: minimum,
            actual,
          },
        }
      : null;
  };
}
