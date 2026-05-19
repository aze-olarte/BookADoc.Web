import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { switchMap } from 'rxjs';
import { SpecializationService } from '../../../../core/services/specialization.service';
import { DoctorService } from '../../services/doctor.service';
import { DoctorsCardComponent } from '../doctors-card/doctors-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-doctors-list',
  imports: [DoctorsCardComponent, MatGridListModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './doctors-list.component.html',
  styleUrl: './doctors-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsListComponent {
  private doctorService = inject(DoctorService);
  private specializationService = inject(SpecializationService);
  specializationOptions = toSignal(this.specializationService.getAll(), {
    initialValue: [],
  });
  selectedSpecialization = signal<number>(0);
  doctors = toSignal(
    toObservable(this.selectedSpecialization).pipe(
      switchMap((id) => this.doctorService.getAll(id)),
    ),
    { initialValue: [] },
  );
}
