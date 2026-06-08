import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsAddFormComponent } from './appointments-add-form.component';

describe('AppointmentsAddFormComponent', () => {
  let component: AppointmentsAddFormComponent;
  let fixture: ComponentFixture<AppointmentsAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsAddFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsAddFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
