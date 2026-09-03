import { Component, inject, OnInit, signal } from '@angular/core';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SlotService } from '../../services/slot.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { Column } from '../../../../core/models/columns';
import { columns } from './slot-llist-columns';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthResponse } from '../../../../core/models/auth-response.model';

@Component({
  selector: 'app-slot-list',
  imports: [GridComponent],
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.scss',
})
export class SlotListComponent implements OnInit {
  private slotService = inject(SlotService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  data = signal<SlotResponse[]>([]);
  readonly columnDefs: Column<SlotResponse>[] = columns;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const user = this.authService.getAuth() as AuthResponse;
    const id = user.id;
    this.slotService.getSlots(id).subscribe({
      next: (data) => {
        this.data.set(data);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
