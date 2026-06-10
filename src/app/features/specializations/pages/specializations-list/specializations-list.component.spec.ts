import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SpecializationResponse } from '../../../../core/models/specialization-response.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SpecializationService } from '../../services/specialization.service';
import { SpecializationsFormComponent } from '../specializations-form/specializations-form.component';
import { SpecializationsListComponent } from './specializations-list.component';

const mockSpecializations: SpecializationResponse[] = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Neurology' },
];

const makeDialogRef = (afterClosedValue: unknown) => ({
  afterClosed: () => of(afterClosedValue),
});

const makeSpecializationService = () => ({
  getAll: vi.fn().mockReturnValue(of(mockSpecializations)),
  delete: vi.fn().mockReturnValue(of(void 0)),
});

const makeToastService = () => ({
  success: vi.fn(),
  error: vi.fn(),
});

const makeDialog = () => ({
  open: vi.fn(),
});

describe('SpecializationsListComponent', () => {
  let fixture: ComponentFixture<SpecializationsListComponent>;
  let component: SpecializationsListComponent;
  let specializationService: ReturnType<typeof makeSpecializationService>;
  let toastService: ReturnType<typeof makeToastService>;
  let dialog: ReturnType<typeof makeDialog>;

  beforeEach(async () => {
    specializationService = makeSpecializationService();
    toastService = makeToastService();
    dialog = makeDialog();

    await TestBed.configureTestingModule({
      imports: [SpecializationsListComponent],
      providers: [
        { provide: SpecializationService, useValue: specializationService },
        { provide: ToastService, useValue: toastService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecializationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads data on init', () => {
    expect(specializationService.getAll).toHaveBeenCalledOnce();
    expect(component.data()).toEqual(mockSpecializations);
  });

  it('shows a toast error when getAll fails', () => {
    const err = new Error('network error');
    specializationService.getAll.mockReturnValue(throwError(() => err));
    component.loadData();
    expect(toastService.error).toHaveBeenCalledWith(err);
  });

  it('opens ConfirmDialogComponent with the correct data on delete', () => {
    dialog.open.mockReturnValue(makeDialogRef(false));
    const item = mockSpecializations[0];
    component.onDelete(item);

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        title: 'Delete Specialization',
        message: `Are you sure you want to delete ${item.name}?`,
        confirmLabel: 'Delete',
      },
    });
  });

  it('deletes and reloads when the confirm dialog returns true', () => {
    dialog.open.mockReturnValue(makeDialogRef(true));
    const item = mockSpecializations[0];
    component.onDelete(item);

    expect(specializationService.delete).toHaveBeenCalledWith(item.id);
    expect(toastService.success).toHaveBeenCalledWith('Specialization deleted');
    expect(specializationService.getAll).toHaveBeenCalledTimes(2); // init + reload
  });

  it('does not delete when the confirm dialog is dismissed', () => {
    dialog.open.mockReturnValue(makeDialogRef(false));
    component.onDelete(mockSpecializations[0]);

    expect(specializationService.delete).not.toHaveBeenCalled();
  });

  it('shows a toast error when delete fails', () => {
    const err = new Error('delete failed');
    specializationService.delete.mockReturnValue(throwError(() => err));
    dialog.open.mockReturnValue(makeDialogRef(true));

    component.onDelete(mockSpecializations[0]);

    expect(toastService.error).toHaveBeenCalledWith(err);
  });

  it('opens SpecializationsFormComponent on add', () => {
    dialog.open.mockReturnValue(makeDialogRef(false));
    component.onAdd();
    expect(dialog.open).toHaveBeenCalledWith(SpecializationsFormComponent);
  });

  it('reloads data when the add dialog returns true', () => {
    dialog.open.mockReturnValue(makeDialogRef(true));
    component.onAdd();
    expect(specializationService.getAll).toHaveBeenCalledTimes(2); // init + reload
  });

  it('does not reload when the add dialog is dismissed', () => {
    dialog.open.mockReturnValue(makeDialogRef(false));
    component.onAdd();
    expect(specializationService.getAll).toHaveBeenCalledOnce(); // init only
  });
});
