import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DoctorSummaryResponse } from '../../../../core/models/doctor-summary-response.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctors-card',
  imports: [MatCardModule, RouterLink],
  templateUrl: './doctors-card.component.html',
  styleUrl: './doctors-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsCardComponent {
  doctor = input.required<DoctorSummaryResponse>();
}
