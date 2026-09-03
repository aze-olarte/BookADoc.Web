import { Component, signal } from '@angular/core';
import { SlotListComponent } from '../../components/slot-list/slot-list.component';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
@Component({
  selector: 'app-slot-views',
  imports: [SlotListComponent, MatButtonToggleModule],
  templateUrl: './slot-views.component.html',
  styleUrl: './slot-views.component.scss',
})
export class SlotViewsComponent {
  currentView = signal<'list' | 'calendar'>('list');

  onViewChange(event: MatButtonToggleChange) {
    this.currentView.set(event.value);
  }
}
