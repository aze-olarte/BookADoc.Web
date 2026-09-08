import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { AuthResponse } from '../../../../core/models/auth-response.model';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { AuthService } from '../../../auth/services/auth.service';
import { SlotCalendarComponent } from '../../components/slot-calendar/slot-calendar.component';
import { SlotFormComponent } from '../../components/slot-form/slot-form.component';
import { SlotListComponent } from '../../components/slot-list/slot-list.component';
@Component({
  selector: 'app-slot-views',
  imports: [SlotListComponent, MatButtonToggleModule, SlotCalendarComponent],
  templateUrl: './slot-views.component.html',
  styleUrl: './slot-views.component.scss',
})
export class SlotViewsComponent implements OnInit {
  @ViewChild('slotList') slotList!: SlotListComponent;
  @ViewChild('slotCalendar') slotCalendar!: SlotCalendarComponent;
  currentView = signal<'list' | 'calendar'>('list');
  doctorId = signal<number>(0);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.getDoctorId();
  }

  getDoctorId(): void {
    const user = this.authService.getAuth() as AuthResponse;
    this.doctorId.set(user.doctorProfileId);
  }

  onViewChange(event: MatButtonToggleChange) {
    this.currentView.set(event.value);
  }

  onUpdate(data?: SlotResponse) {
    const dialogRef = this.dialog.open(SlotFormComponent, {
      data: {
        doctorId: this.doctorId(),
        event: data,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        if (this.currentView() === 'list' && this.slotList) {
          this.slotList.loadData();
        } else if (this.currentView() === 'calendar' && this.slotCalendar) {
          this.slotCalendar.loadData();
        }
      }
    });
  }
}
