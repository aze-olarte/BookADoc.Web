import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DoctorResponse } from '../../../../core/models/doctor-response.model';

@Component({
  selector: 'app-doctors-card',
  imports: [MatCardModule],
  templateUrl: './doctors-card.component.html',
  styleUrl: './doctors-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsCardComponent {
  doctor = input.required<DoctorResponse>();
}
