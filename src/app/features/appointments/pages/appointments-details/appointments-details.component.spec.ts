import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentsDetailsComponent } from './appointments-details.component';

describe('AppointmentsDetailsComponent', () => {
  let fixture: ComponentFixture<AppointmentsDetailsComponent>;
  let component: AppointmentsDetailsComponent;
  let appointmentService: { get: Mock };

  const makeAppointment = (id: number) => ({ id }) as unknown as AppointmentResponse;

  async function createWithId(idValue: unknown) {
    fixture = TestBed.createComponent(AppointmentsDetailsComponent);
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

  beforeEach(async () => {
    appointmentService = { get: vi.fn().mockReturnValue(of(makeAppointment(5))) };

    TestBed.overrideComponent(AppointmentsDetailsComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [AppointmentsDetailsComponent],
      providers: [{ provide: AppointmentService, useValue: appointmentService }],
    }).compileComponents();
  });

  it('should create', async () => {
    await createWithId(5);

    expect(component).toBeTruthy();
  });

  describe('id input', () => {
    it('should transform a string id (e.g. from a route param) into a number', async () => {
      await createWithId('5');

      expect(component.id()).toBe(5);
      expect(appointmentService.get).toHaveBeenCalledWith(5);
    });

    it('should accept a numeric id as is', async () => {
      await createWithId(12);

      expect(component.id()).toBe(12);
      expect(appointmentService.get).toHaveBeenCalledWith(12);
    });
  });

  describe('loading the appointment', () => {
    it('should be null while the request is pending', async () => {
      appointmentService.get.mockReturnValue(new Subject<AppointmentResponse>());

      await createWithId(5);

      expect(appointmentService.get).toHaveBeenCalledTimes(1);
      expect(component.appointment()).toBeNull();
    });

    it('should expose the appointment once the request resolves', async () => {
      const response$ = new Subject<AppointmentResponse>();
      appointmentService.get.mockReturnValue(response$);
      await createWithId(5);

      const appointment = makeAppointment(5);
      response$.next(appointment);

      expect(component.appointment()).toBe(appointment);
    });

    it('should fetch the appointment once on first render', async () => {
      await createWithId(5);

      expect(appointmentService.get).toHaveBeenCalledTimes(1);
      expect(component.appointment()).toEqual(makeAppointment(5));
    });
  });

  describe('when the id changes', () => {
    it('should fetch the appointment for the new id', async () => {
      await createWithId(5);
      appointmentService.get.mockReturnValue(of(makeAppointment(6)));

      await changeId(6);

      expect(appointmentService.get).toHaveBeenCalledTimes(2);
      expect(appointmentService.get).toHaveBeenLastCalledWith(6);
      expect(component.appointment()).toEqual(makeAppointment(6));
    });

    it('should not refetch when the same id is set again', async () => {
      await createWithId(5);

      await changeId(5);

      expect(appointmentService.get).toHaveBeenCalledTimes(1);
    });

    it('should ignore a stale response from the previous id (switchMap)', async () => {
      const first$ = new Subject<AppointmentResponse>();
      const second$ = new Subject<AppointmentResponse>();
      appointmentService.get.mockReturnValueOnce(first$).mockReturnValueOnce(second$);

      await createWithId(1);
      await changeId(2);

      first$.next(makeAppointment(1));
      expect(component.appointment()).toBeNull();

      second$.next(makeAppointment(2));
      expect(component.appointment()).toEqual(makeAppointment(2));
    });
  });
});
