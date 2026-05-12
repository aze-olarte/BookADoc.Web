import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ToastService', () => {
  let service: ToastService;
  let snackBarMock: {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    snackBarMock = {
      open: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        {
          provide: MatSnackBar,
          useValue: snackBarMock,
        },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call snackBar.open with correct args on success', () => {
    service.success('Saved!');

    expect(snackBarMock.open).toHaveBeenCalledWith('Saved!', 'X', {
      duration: 3000,
      panelClass: ['toast-base', 'toast-success'],
    });
  });

  it('should call snackBar.open with correct args on info', () => {
    service.info('Info text');

    expect(snackBarMock.open).toHaveBeenCalledWith('Info text', 'X', {
      duration: 3000,
      panelClass: ['toast-base', 'toast-info'],
    });
  });

  it('should call snackBar.open with correct args on error', () => {
    service.error('Error');

    expect(snackBarMock.open).toHaveBeenCalledWith('Error', 'X', {
      duration: 3000,
      panelClass: ['toast-base', 'toast-error'],
    });
  });

  it('should call snackBar.open with correct args on warning', () => {
    service.warning('Warning');

    expect(snackBarMock.open).toHaveBeenCalledWith('Warning', 'X', {
      duration: 3000,
      panelClass: ['toast-base', 'toast-warning'],
    });
  });
});
