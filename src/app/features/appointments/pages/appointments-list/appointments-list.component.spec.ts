import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { AuthService } from '../../../auth/services/auth.service';
import { AppointmentsAddFormComponent } from '../../components/appointments-add-form/appointments-add-form.component';
import { AppointmentsNotesFormComponent } from '../../components/appointments-notes-form/appointments-notes-form.component';
import { AppointmentsStatusFormComponent } from '../../components/appointments-status-form/appointments-status-form.component';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsListComponent } from './appointments-list.component';
import { columns } from './appointments-list-columns';

describe('AppointmentsListComponent', () => {
  let component: AppointmentsListComponent;

  let appointmentService: {
    getAll: Mock;
    getUserAppointments: Mock;
    getAppointmentReport: Mock;
  };
  let authService: { getRole: Mock };
  let dialog: { open: Mock };
  let router: { navigate: Mock };

  const makeRow = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 1,
      status: 'Pending',
      notes: 'Some notes',
      ...overrides,
    }) as AppointmentResponse;

  const allAppointments = [makeRow({ id: 1 }), makeRow({ id: 2 })];
  const userAppointments = [makeRow({ id: 3 })];

  async function setup(role: string) {
    appointmentService = {
      getAll: vi.fn().mockReturnValue(of(allAppointments)),
      getUserAppointments: vi.fn().mockReturnValue(of(userAppointments)),
      getAppointmentReport: vi.fn(),
    };
    authService = { getRole: vi.fn().mockReturnValue(role) };
    dialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };
    router = { navigate: vi.fn() };

    TestBed.overrideComponent(AppointmentsListComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [AppointmentsListComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentService },
        { provide: AuthService, useValue: authService },
        { provide: MatDialog, useValue: dialog },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppointmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function closeDialogWith(result: boolean | undefined) {
    dialog.open.mockReturnValue({ afterClosed: () => of(result) });
  }

  function findAction(type: string) {
    return component.actions.find((a) => a.type === type);
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('as a Patient', () => {
    beforeEach(async () => {
      await setup('Patient');
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should read the role from the auth service', () => {
      expect(component.role).toBe('Patient');
    });

    it('should hide the patientName column', () => {
      expect(columns.some((c) => c.columnDef === 'patientName')).toBe(true);

      expect(component.columnDefs.some((c) => c.columnDef === 'patientName')).toBe(false);
      expect(component.columnDefs).toEqual(columns.filter((c) => c.columnDef !== 'patientName'));
    });

    it('should keep the doctorName column', () => {
      expect(component.columnDefs.some((c) => c.columnDef === 'doctorName')).toBe(
        columns.some((c) => c.columnDef === 'doctorName'),
      );
    });

    it("should load the user's own appointments, not all of them", () => {
      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
      expect(appointmentService.getAll).not.toHaveBeenCalled();
      expect(component.data()).toEqual(userAppointments);
    });
  });

  describe('as a Doctor', () => {
    beforeEach(async () => {
      await setup('Doctor');
    });

    it('should hide the doctorName column', () => {
      expect(columns.some((c) => c.columnDef === 'doctorName')).toBe(true);

      expect(component.columnDefs.some((c) => c.columnDef === 'doctorName')).toBe(false);
      expect(component.columnDefs).toEqual(columns.filter((c) => c.columnDef !== 'doctorName'));
    });

    it("should load the user's own appointments", () => {
      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
      expect(appointmentService.getAll).not.toHaveBeenCalled();
      expect(component.data()).toEqual(userAppointments);
    });
  });

  describe('as an Admin', () => {
    beforeEach(async () => {
      await setup('Admin');
    });

    it('should show all columns', () => {
      expect(component.columnDefs).toBe(columns);
    });

    it('should load all appointments', () => {
      expect(appointmentService.getAll).toHaveBeenCalledTimes(1);
      expect(appointmentService.getUserAppointments).not.toHaveBeenCalled();
      expect(component.data()).toEqual(allAppointments);
    });
  });

  describe('with an unrecognised role', () => {
    beforeEach(async () => {
      await setup('');
    });

    it('should show all columns', () => {
      expect(component.columnDefs).toBe(columns);
    });

    it('should fall back to loading the user appointments', () => {
      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
      expect(appointmentService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('loadData()', () => {
    it('should leave data empty when the request fails', async () => {
      await setup('Patient');
      appointmentService.getUserAppointments.mockReturnValue(throwError(() => new Error('boom')));
      component.data.set([]);

      expect(() => component.loadData()).not.toThrow();

      expect(component.data()).toEqual([]);
    });

    it('should replace the data with the latest response', async () => {
      await setup('Patient');
      const fresh = [makeRow({ id: 99 })];
      appointmentService.getUserAppointments.mockReturnValue(of(fresh));

      component.loadData();

      expect(component.data()).toEqual(fresh);
    });
  });

  describe('row actions', () => {
    it('should define view, changeStatus and updateNotes actions', async () => {
      await setup('Patient');

      expect(component.actions.map((a) => a.type)).toEqual(['view', 'changeStatus', 'updateNotes']);
    });

    it('should always show the view action (no visibility rule)', async () => {
      await setup('Patient');

      expect(findAction('view')?.visible).toBeUndefined();
    });

    describe('changeStatus visibility', () => {
      it('should be hidden for Admin whatever the status', async () => {
        await setup('Admin');

        for (const status of ['Pending', 'Confirmed', 'Cancelled', 'Completed']) {
          expect(findAction('changeStatus')?.visible?.(makeRow({ status }))).toBe(false);
        }
      });

      it.each(['Patient', 'Doctor'])(
        'should be hidden for a %s on closed appointments',
        async (role) => {
          await setup(role);

          expect(findAction('changeStatus')?.visible?.(makeRow({ status: 'Cancelled' }))).toBe(
            false,
          );
          expect(findAction('changeStatus')?.visible?.(makeRow({ status: 'Completed' }))).toBe(
            false,
          );
        },
      );

      it.each(['Patient', 'Doctor'])(
        'should be shown for a %s on open appointments',
        async (role) => {
          await setup(role);

          expect(findAction('changeStatus')?.visible?.(makeRow({ status: 'Pending' }))).toBe(true);
          expect(findAction('changeStatus')?.visible?.(makeRow({ status: 'Confirmed' }))).toBe(
            true,
          );
        },
      );
    });

    describe('updateNotes visibility', () => {
      it('should be shown for a Doctor on a completed appointment', async () => {
        await setup('Doctor');

        expect(findAction('updateNotes')?.visible?.(makeRow({ status: 'Completed' }))).toBe(true);
      });

      it('should be hidden for a Doctor on a non-completed appointment', async () => {
        await setup('Doctor');

        for (const status of ['Pending', 'Confirmed', 'Cancelled']) {
          expect(findAction('updateNotes')?.visible?.(makeRow({ status }))).toBe(false);
        }
      });

      it.each(['Patient', 'Admin'])(
        'should be hidden for a %s even when completed',
        async (role) => {
          await setup(role);

          expect(findAction('updateNotes')?.visible?.(makeRow({ status: 'Completed' }))).toBe(
            false,
          );
        },
      );
    });
  });

  describe('onActionTriggered()', () => {
    beforeEach(async () => {
      await setup('Doctor');
    });

    it('should route "view" to onView with the row id', () => {
      const spy = vi.spyOn(component, 'onView').mockImplementation(() => {});

      component.onActionTriggered({ action: 'view', row: makeRow({ id: 8 }) });

      expect(spy).toHaveBeenCalledWith(8);
    });

    it('should route "changeStatus" to onChangeStatus with the row', () => {
      const spy = vi.spyOn(component, 'onChangeStatus').mockImplementation(() => {});
      const row = makeRow({ id: 8 });

      component.onActionTriggered({ action: 'changeStatus', row });

      expect(spy).toHaveBeenCalledWith(row);
    });

    it('should route "updateNotes" to onUpdateNotes with the row', () => {
      const spy = vi.spyOn(component, 'onUpdateNotes').mockImplementation(() => {});
      const row = makeRow({ id: 8 });

      component.onActionTriggered({ action: 'updateNotes', row });

      expect(spy).toHaveBeenCalledWith(row);
    });

    it('should do nothing for an unknown action', () => {
      const view = vi.spyOn(component, 'onView').mockImplementation(() => {});
      const status = vi.spyOn(component, 'onChangeStatus').mockImplementation(() => {});
      const notes = vi.spyOn(component, 'onUpdateNotes').mockImplementation(() => {});

      component.onActionTriggered({ action: 'delete', row: makeRow() });

      expect(view).not.toHaveBeenCalled();
      expect(status).not.toHaveBeenCalled();
      expect(notes).not.toHaveBeenCalled();
    });
  });

  describe('onView()', () => {
    it('should navigate to the appointment details page', async () => {
      await setup('Patient');

      component.onView(15);

      expect(router.navigate).toHaveBeenCalledWith(['/portal/appointments', 15]);
    });
  });

  describe('onChangeStatus()', () => {
    beforeEach(async () => {
      await setup('Doctor');
    });

    it('should open the status dialog with the appointment id, role and status', () => {
      component.onChangeStatus(makeRow({ id: 5, status: 'Confirmed' }));

      expect(dialog.open).toHaveBeenCalledWith(AppointmentsStatusFormComponent, {
        disableClose: true,
        data: { id: 5, role: 'Doctor', status: 'Confirmed' },
      });
    });

    it('should reload the data when the dialog is confirmed', () => {
      closeDialogWith(true);
      appointmentService.getUserAppointments.mockClear();

      component.onChangeStatus(makeRow());

      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
    });

    it.each([false, undefined])(
      'should not reload the data when the dialog closes with %s',
      (result) => {
        closeDialogWith(result);
        appointmentService.getUserAppointments.mockClear();

        component.onChangeStatus(makeRow());

        expect(appointmentService.getUserAppointments).not.toHaveBeenCalled();
      },
    );
  });

  describe('onUpdateNotes()', () => {
    beforeEach(async () => {
      await setup('Doctor');
    });

    it('should open the notes dialog with the appointment id and notes', () => {
      component.onUpdateNotes(makeRow({ id: 6, notes: 'Prior notes' }));

      expect(dialog.open).toHaveBeenCalledWith(AppointmentsNotesFormComponent, {
        disableClose: true,
        data: { id: 6, notes: 'Prior notes' },
      });
    });

    it('should reload the data when the dialog is confirmed', () => {
      closeDialogWith(true);
      appointmentService.getUserAppointments.mockClear();

      component.onUpdateNotes(makeRow());

      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
    });

    it.each([false, undefined])(
      'should not reload the data when the dialog closes with %s',
      (result) => {
        closeDialogWith(result);
        appointmentService.getUserAppointments.mockClear();

        component.onUpdateNotes(makeRow());

        expect(appointmentService.getUserAppointments).not.toHaveBeenCalled();
      },
    );
  });

  describe('onAddAppointment()', () => {
    beforeEach(async () => {
      await setup('Patient');
    });

    it('should open the add dialog that cannot be dismissed by clicking outside', () => {
      component.onAddAppointment();

      expect(dialog.open).toHaveBeenCalledWith(AppointmentsAddFormComponent, {
        disableClose: true,
      });
    });

    it('should reload the data when an appointment was added', () => {
      closeDialogWith(true);
      appointmentService.getUserAppointments.mockClear();

      component.onAddAppointment();

      expect(appointmentService.getUserAppointments).toHaveBeenCalledTimes(1);
    });

    it.each([false, undefined])(
      'should not reload the data when the dialog closes with %s',
      (result) => {
        closeDialogWith(result);
        appointmentService.getUserAppointments.mockClear();

        component.onAddAppointment();

        expect(appointmentService.getUserAppointments).not.toHaveBeenCalled();
      },
    );
  });

  describe('onGenerateReport()', () => {
    let createObjectURL: Mock;
    let revokeObjectURL: Mock;
    let clickedAnchor: HTMLAnchorElement | undefined;

    beforeEach(async () => {
      await setup('Admin');

      createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      revokeObjectURL = vi.fn();
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = revokeObjectURL;

      clickedAnchor = undefined;
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        clickedAnchor = this;
      });
    });

    it('should download the report as a dated PDF', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-16T10:00:00Z'));
      const blob = new Blob(['pdf'], { type: 'application/pdf' });
      appointmentService.getAppointmentReport.mockReturnValue(of(blob));

      component.onGenerateReport();

      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(clickedAnchor).toBeDefined();
      expect(clickedAnchor?.href).toBe('blob:mock-url');
      expect(clickedAnchor?.download).toBe('appointment-report-2026-11-16.pdf');
    });

    it('should revoke the object URL after triggering the download', () => {
      appointmentService.getAppointmentReport.mockReturnValue(of(new Blob(['pdf'])));

      component.onGenerateReport();

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should not attempt a download when the request fails', () => {
      appointmentService.getAppointmentReport.mockReturnValue(throwError(() => new Error('boom')));

      expect(() => component.onGenerateReport()).not.toThrow();

      expect(createObjectURL).not.toHaveBeenCalled();
      expect(clickedAnchor).toBeUndefined();
      expect(revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
