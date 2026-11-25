import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-doctors-profile',
  imports: [
    MatCardModule,
    MatProgressSpinner,
    CurrencyPipe,
    MatIconModule,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './doctors-profile.component.html',
  styleUrl: './doctors-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsProfileComponent {
  private doctorService = inject(DoctorService);
  private authService = inject(AuthService);
  readonly route = this.authService.getAccessToken() !== null ? '/portal/doctors' : '';

  id = input.required({ transform: numberAttribute });
  doctor = toSignal(toObservable(this.id).pipe(switchMap((id) => this.doctorService.get(id))), {
    initialValue: null,
  });
}
