import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotCalendarComponent } from './slot-calendar.component';

describe('SlotCalendarComponent', () => {
  let component: SlotCalendarComponent;
  let fixture: ComponentFixture<SlotCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotCalendarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotCalendarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
