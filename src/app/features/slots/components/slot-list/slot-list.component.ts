import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { isBefore, startOfDay } from 'date-fns';
import { Action } from '../../../../core/models/action';
import { Column } from '../../../../core/models/columns';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { GridComponent } from '../../../../shared/components/grid/grid.component';
import { SlotService } from '../../services/slot.service';
import { columns } from './slot-list-columns';

@Component({
  selector: 'app-slot-list',
  imports: [GridComponent, MatButtonModule, MatIconModule],
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.scss',
})
export class SlotListComponent implements OnInit {
  private slotService = inject(SlotService);
  readonly columnDefs: Column<SlotResponse>[] = columns;
  data = signal<SlotResponse[]>([]);
  id = input.required<number>();
  emitAdd = output<SlotResponse | undefined>();
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
      error: () => {},
    });
  }

  add(data?: SlotResponse): void {
    this.emitAdd.emit(data);
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
