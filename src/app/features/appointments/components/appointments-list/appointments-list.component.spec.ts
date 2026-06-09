import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AppointmentsListComponent } from './appointments-list.component';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';

describe('AppointmentsListComponent', () => {
  let fixture: ComponentFixture<AppointmentsListComponent>;
  let component: AppointmentsListComponent;

  let appointmentServiceMock = {
    getAll: vi.fn(),
    getUserAppointments: vi.fn(),
  };
  let authServiceMock = { getRole: vi.fn() };
  let toastServiceMock = { success: vi.fn(), error: vi.fn() };
  let routerMock = { navigate: vi.fn() };
  let dialogMock = { open: vi.fn() };

  const mockAppointments = [
    { id: 1, patientName: 'Alice', doctorName: 'Dr. Smith', status: AppointmentStatus.Pending },
    { id: 2, patientName: 'Bob', doctorName: 'Dr. Jones', status: AppointmentStatus.Completed },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    appointmentServiceMock.getAll.mockReturnValue(of(mockAppointments));
    appointmentServiceMock.getUserAppointments.mockReturnValue(of(mockAppointments));
  });

  async function setup(role: string) {
    authServiceMock.getRole.mockReturnValue(role);

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('loadData', () => {
    it('calls getAll when the role is Admin', async () => {
      await setup('Admin');
      expect(appointmentServiceMock.getAll).toHaveBeenCalled();
      expect(appointmentServiceMock.getUserAppointments).not.toHaveBeenCalled();
    });

    it('calls getUserAppointments when the role is not Admin', async () => {
      await setup('Doctor');
      expect(appointmentServiceMock.getUserAppointments).toHaveBeenCalled();
      expect(appointmentServiceMock.getAll).not.toHaveBeenCalled();
    });

    it('sets the data signal with the response', async () => {
      await setup('Admin');
      expect(component.data()).toEqual(mockAppointments);
    });

    it('shows an error toast when loading fails', async () => {
      appointmentServiceMock.getAll.mockReturnValue(throwError(() => new Error('load error')));
      await setup('Admin');
      expect(toastServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('setColumns', () => {
    it('excludes patientName column for Patient role', async () => {
      await setup('Patient');
      expect(component.columnDefs.some((c) => c.columnDef === 'patientName')).toBe(false);
    });

    it('excludes doctorName column for Doctor role', async () => {
      await setup('Doctor');
      expect(component.columnDefs.some((c) => c.columnDef === 'doctorName')).toBe(false);
    });

    it('shows all columns for Admin role', async () => {
      await setup('Admin');
      expect(component.columnDefs.some((c) => c.columnDef === 'patientName')).toBe(true);
      expect(component.columnDefs.some((c) => c.columnDef === 'doctorName')).toBe(true);
    });
  });

  describe('onActionTriggered', () => {
    it('navigates to the appointment detail page on view action', async () => {
      await setup('Admin');
      component.onActionTriggered({ action: 'view', row: mockAppointments[0] as any });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/portal/appointments', 1]);
    });

    it('opens the status form dialog on changeStatus action', async () => {
      await setup('Admin');
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });
      component.onActionTriggered({ action: 'changeStatus', row: mockAppointments[0] as any });
      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('opens the notes form dialog on addNotes action', async () => {
      await setup('Admin');
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });
      component.onActionTriggered({ action: 'addNotes', row: mockAppointments[0] as any });
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  describe('dialog after close', () => {
    it('reloads data when the status dialog is confirmed', async () => {
      await setup('Admin');
      dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
      component.onChangeStatus(mockAppointments[0] as any);
      expect(appointmentServiceMock.getAll).toHaveBeenCalledTimes(2);
    });

    it('does not reload data when the status dialog is dismissed', async () => {
      await setup('Admin');
      dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });
      component.onChangeStatus(mockAppointments[0] as any);
      expect(appointmentServiceMock.getAll).toHaveBeenCalledTimes(1);
    });

    it('reloads data when the notes dialog is confirmed', async () => {
      await setup('Admin');
      dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
      component.onAddNotes(mockAppointments[0] as any);
      expect(appointmentServiceMock.getAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('action visibility', () => {
    it('hides changeStatus for Cancelled appointments', async () => {
      await setup('Doctor');
      const action = component.actions.find((a) => a.type === 'changeStatus')!;
      expect(action.visible!({ status: AppointmentStatus.Cancelled } as any)).toBe(false);
    });

    it('hides changeStatus for Completed appointments', async () => {
      await setup('Doctor');
      const action = component.actions.find((a) => a.type === 'changeStatus')!;
      expect(action.visible!({ status: AppointmentStatus.Completed } as any)).toBe(false);
    });

    it('shows changeStatus for Pending appointments', async () => {
      await setup('Doctor');
      const action = component.actions.find((a) => a.type === 'changeStatus')!;
      expect(action.visible!({ status: AppointmentStatus.Pending } as any)).toBe(true);
    });

    it('shows addNotes for a Doctor on a Completed appointment', async () => {
      await setup('Doctor');
      const action = component.actions.find((a) => a.type === 'addNotes')!;
      expect(action.visible!({ status: AppointmentStatus.Completed } as any)).toBe(true);
    });

    it('hides addNotes for a Doctor on a non-Completed appointment', async () => {
      await setup('Doctor');
      const action = component.actions.find((a) => a.type === 'addNotes')!;
      expect(action.visible!({ status: AppointmentStatus.Pending } as any)).toBe(false);
    });

    it('hides addNotes for a non-Doctor role even on Completed appointments', async () => {
      await setup('Patient');
      const action = component.actions.find((a) => a.type === 'addNotes')!;
      expect(action.visible!({ status: AppointmentStatus.Completed } as any)).toBe(false);
    });
  });
});
