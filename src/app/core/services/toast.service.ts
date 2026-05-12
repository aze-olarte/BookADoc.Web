import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastType } from '../models/toast.model';

const DEFAULT_DURATION = 3000;
const TOAST_CONFIG: Record<ToastType, { panelClass: string; action: string }> = {
  success: { panelClass: 'toast-success', action: 'X' },
  error: { panelClass: 'toast-error', action: 'X' },
  warning: { panelClass: 'toast-warning', action: 'X' },
  info: { panelClass: 'toast-info', action: 'X' },
};

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  private show(type: ToastType, message: string) {
    const { panelClass, action: defaultAction } = TOAST_CONFIG[type];
    const config: MatSnackBarConfig = {
      duration: DEFAULT_DURATION,
      panelClass: ['toast-base', panelClass],
    };
    return this.snackBar.open(message, defaultAction, config);
  }

  success(message: string) {
    return this.show('success', message);
  }

  info(message: string) {
    return this.show('info', message);
  }

  error(message: string) {
    return this.show('error', message);
  }

  warning(message: string) {
    return this.show('warning', message);
  }
}
