import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AppointmentResponse } from '../../../../core/models/appointment-response.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-appointments-details.component',
  imports: [MatProgressSpinnerModule, DatePipe],
  templateUrl: './appointments-details.component.html',
  styleUrl: './appointments-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsDetailsComponent {
  private appointmentService = inject(AppointmentService);
  id = input.required({ transform: numberAttribute });
  appointment = toSignal<AppointmentResponse>(
    toObservable(this.id).pipe(switchMap((id) => this.appointmentService.get(id))),
    {
      initialValue: null,
    },
  );
}
