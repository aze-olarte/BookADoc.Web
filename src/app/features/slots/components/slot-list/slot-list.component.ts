import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SlotService } from '../../services/slot.service';
import { columns } from './slot-list-columns';
import { Action } from '../../../../core/models/action';
import { isBefore, startOfDay } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-slot-list',
  imports: [GridComponent, MatButtonModule, MatIconModule],
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.scss',
})
export class SlotListComponent implements OnInit {
  private slotService = inject(SlotService);
  private toastService = inject(ToastService);
  readonly columnDefs: Column<SlotResponse>[] = columns;
  data = signal<SlotResponse[]>([]);
  id = input.required<number>();
  emitUpdate = output<SlotResponse | undefined>();
  emitDelete = output<SlotResponse>();

  actions: Action<SlotResponse>[] = [
    {
      type: 'update',
      label: 'Edit',
      icon: 'edit_outline',
      visible: (item) => this.isEditVisible(item),
    },
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
      error: () => {},
    });
  }

  update(data?: SlotResponse): void {
    this.emitUpdate.emit(data);
  }

  delete(data: SlotResponse): void {
    this.emitDelete.emit(data);
  }

  onActionTriggered({ action, row }: { action: string; row: SlotResponse }) {
    if (action === 'delete') {
      this.delete(row);
    } else if (action === 'update') {
      this.update(row);
    }
  }

  private isDeleteVisible(data: SlotResponse): boolean {
    return !data.isBooked;
  }

  private isEditVisible(data: SlotResponse): boolean {
    return !data.isBooked && !isBefore(data.date, startOfDay(new Date()));
  }
}
