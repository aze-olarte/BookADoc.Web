import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from '../../../../core/services/toast.service';
import { SpecializationService } from '../../services/specialization.service';
import { SpecializationsFormComponent } from './specializations-form.component';

describe('SpecializationsFormComponent', () => {
  let fixture: ComponentFixture<SpecializationsFormComponent>;
  let component: SpecializationsFormComponent;
  let specializationServiceMock = { add: vi.fn() };
  let toastServiceMock = { success: vi.fn(), error: vi.fn() };
  let dialogRefMock = { close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationsFormComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: SpecializationService, useValue: specializationServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecializationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initialises with an empty invalid form', () => {
    expect(component.f.name.value).toBe('');
    expect(component.fg.invalid).toBe(true);
  });

  it('marks all controls as touched and does not call the service when the form is invalid', () => {
    component.save();
    expect(component.f.name.touched).toBe(true);
    expect(specializationServiceMock.add).not.toHaveBeenCalled();
  });

  it('calls the service with the form value when the form is valid', () => {
    specializationServiceMock.add.mockReturnValue(of(void 0));
    component.f.name.setValue('Cardiology');
    component.save();
    expect(specializationServiceMock.add).toHaveBeenCalledWith({ name: 'Cardiology' });
  });
});
