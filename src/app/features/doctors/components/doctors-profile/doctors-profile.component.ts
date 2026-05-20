import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-doctors-profile',
  imports: [MatCardModule, MatProgressSpinner],
  templateUrl: './doctors-profile.component.html',
  styleUrl: './doctors-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsProfileComponent {
  private doctorService = inject(DoctorService);
  id = input.required({ transform: numberAttribute });
  doctor = toSignal(toObservable(this.id).pipe(switchMap((id) => this.doctorService.get(id))), {
    initialValue: null,
  });
}
