import { Component } from '@angular/core';
import { SlotListComponent } from '../../components/slot-list/slot-list.component';

@Component({
  selector: 'app-slot-views',
  imports: [SlotListComponent],
  templateUrl: './slot-views.component.html',
  styleUrl: './slot-views.component.scss',
})
export class SlotViewsComponent {}
