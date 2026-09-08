import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SlotService } from '../../services/slot.service';
import { columns } from './slot-list-columns';
import { Action } from '../../../../core/models/action';

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
  emitDelete = output<SlotResponse>();

  actions: Action<SlotResponse>[] = [
    {
      type: 'delete',
      label: 'Delete',
      icon: 'delete_outline',
      visible: (item) => this.isDeleteVisible(item),
    },
  ];

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

  delete(data: SlotResponse): void {
    this.emitDelete.emit(data);
  }

  onActionTriggered({ action, row }: { action: string; row: SlotResponse }) {
    if (action === 'delete') {
      this.delete(row);
    }
  }

  private isDeleteVisible(data: SlotResponse): boolean {
    return !data.isBooked;
  }
}
