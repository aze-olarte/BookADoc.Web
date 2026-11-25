import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Action } from '../../../../core/models/action';
import { Column } from '../../../../core/models/columns';
import { DoctorSummaryResponse } from '../../../../core/models/doctor-summary-response.model';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { AuthService } from '../../../auth/services/auth.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { DoctorService } from '../../services/doctor.service';
import { columns } from './doctors-list-columns';

@Component({
  selector: 'app-doctors-list',
  imports: [MatSelectModule, MatFormFieldModule, GridComponent],
  templateUrl: './doctors-list.component.html',
  styleUrl: './doctors-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorsListComponent {
  private doctorService = inject(DoctorService);
  private specializationService = inject(SpecializationService);
  readonly columnDefs: Column<DoctorSummaryResponse>[] = columns;
  private router = inject(Router);
  private authService = inject(AuthService);

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

  actions: Action<DoctorSummaryResponse>[] = [{ type: 'view', label: 'View', icon: 'visibility' }];

  onActionTriggered({ action, row }: { action: string; row: DoctorSummaryResponse }) {
    if (action === 'view') {
      this.onView(row.id);
    }
  }

  onView(id: number) {
    if (!!this.authService.getAccessToken()) {
      this.router.navigate(['/portal/doctors', id]);
    } else {
      this.router.navigate(['/doctors', id]);
    }
  }
}
