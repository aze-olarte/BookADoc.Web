import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { AuthResponse } from '../../../../core/models/auth-response.model';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../auth/services/auth.service';
import { SlotCalendarComponent } from '../../components/slot-calendar/slot-calendar.component';
import { SlotFormComponent } from '../../components/slot-form/slot-form.component';
import { SlotListComponent } from '../../components/slot-list/slot-list.component';
import { SlotService } from '../../services/slot.service';
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
  private slotService = inject(SlotService);
  private toastService = inject(ToastService);

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

  reloadData(): void {
    if (this.currentView() === 'list' && this.slotList) {
      this.slotList.loadData();
    } else if (this.currentView() === 'calendar' && this.slotCalendar) {
      this.slotCalendar.loadData(this.slotCalendar.startDate, this.slotCalendar.endDate);
    }
  }

  onUpdate(data?: SlotResponse) {
    const dialogRef = this.dialog.open(SlotFormComponent, {
      disableClose: true,
      data: {
        doctorId: this.doctorId(),
        event: data,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.reloadData();
      }
    });
  }

  onDelete(data: SlotResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: 'Delete Slot',
        message: 'Are you sure you want to delete this slot?',
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.slotService.deleteSlot(this.doctorId(), data.id).subscribe({
          next: () => {
            this.toastService.success('Slot deleted');
            this.reloadData();
          },
          error: () => {},
        });
      }
    });
  }
}
