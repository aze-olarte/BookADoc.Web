import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SlotService } from '../../services/slot.service';
import { columns } from './slot-list-columns';

@Component({
  selector: 'app-slot-list',
  imports: [GridComponent],
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.scss',
})
export class SlotListComponent implements OnInit {
  private slotService = inject(SlotService);
  private toastService = inject(ToastService);
  readonly columnDefs: Column<SlotResponse>[] = columns;
  data = signal<SlotResponse[]>([]);
  id = input.required<number>();
  emitUpdate = output<void>();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.slotService.getSlots(this.id()).subscribe({
      next: (data) => {
        this.data.set(data);
      },
      error: (error) => this.toastService.error(error),
    });
  }

  update(): void {
    this.emitUpdate.emit();
  }
}
