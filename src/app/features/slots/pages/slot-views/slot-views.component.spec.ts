import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotViewsComponent } from './slot-views.component';

describe('SlotViewsComponent', () => {
  let component: SlotViewsComponent;
  let fixture: ComponentFixture<SlotViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotViewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotViewsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
