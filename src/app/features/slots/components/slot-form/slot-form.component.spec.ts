import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotFormComponent } from './slot-form.component';

describe('SlotFormComponent', () => {
  let component: SlotFormComponent;
  let fixture: ComponentFixture<SlotFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
