import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

const makeDialogRef = () => ({ close: vi.fn() });

const mountComponent = (
  data: ConfirmDialogData,
  dialogRef = makeDialogRef(),
): {
  fixture: ComponentFixture<ConfirmDialogComponent>;
  dialogRef: ReturnType<typeof makeDialogRef>;
} => {
  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  });

  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();
  return { fixture, dialogRef };
};

const getTitle = (fixture: ComponentFixture<ConfirmDialogComponent>) =>
  fixture.debugElement.query(By.css('[mat-dialog-title]'))?.nativeElement as HTMLElement | null;

const getContent = (fixture: ComponentFixture<ConfirmDialogComponent>) =>
  fixture.debugElement.query(By.css('mat-dialog-content'))?.nativeElement as HTMLElement | null;

const getCancelButton = (fixture: ComponentFixture<ConfirmDialogComponent>) =>
  fixture.debugElement
    .queryAll(By.css('button'))
    .find((b) => b.attributes['mat-dialog-close'] !== undefined)?.nativeElement as
    | HTMLButtonElement
    | undefined;

const getConfirmButton = (fixture: ComponentFixture<ConfirmDialogComponent>) =>
  fixture.debugElement
    .queryAll(By.css('button'))
    .find((b) => b.attributes['mat-flat-button'] !== undefined)?.nativeElement as
    | HTMLButtonElement
    | undefined;

describe('ConfirmDialogComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders the title and message from dialog data', () => {
    const { fixture } = mountComponent({ title: 'Delete item', message: 'This cannot be undone.' });
    expect(getTitle(fixture)?.textContent?.trim()).toBe('Delete item');
    expect(getContent(fixture)?.textContent?.trim()).toBe('This cannot be undone.');
  });

  it('shows default labels when confirmLabel and cancelLabel are not provided', () => {
    const { fixture } = mountComponent({ title: 'T', message: 'M' });
    expect(getCancelButton(fixture)?.textContent?.trim()).toBe('Cancel');
    expect(getConfirmButton(fixture)?.textContent?.trim()).toBe('Confirm');
  });

  it('shows custom confirmLabel and cancelLabel when provided', () => {
    const { fixture } = mountComponent({
      title: 'T',
      message: 'M',
      cancelLabel: 'No, go back',
      confirmLabel: 'Yes, delete',
    });
    expect(getCancelButton(fixture)?.textContent?.trim()).toBe('No, go back');
    expect(getConfirmButton(fixture)?.textContent?.trim()).toBe('Yes, delete');
  });

  it('calls dialogRef.close(true) when the confirm button is clicked', () => {
    const dialogRef = makeDialogRef();
    const { fixture } = mountComponent({ title: 'T', message: 'M' }, dialogRef);
    getConfirmButton(fixture)?.click();
    fixture.detectChanges();
    expect(dialogRef.close).toHaveBeenCalledOnce();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('does not call dialogRef.close(true) when the cancel button is clicked', () => {
    const dialogRef = makeDialogRef();
    const { fixture } = mountComponent({ title: 'T', message: 'M' }, dialogRef);
    getCancelButton(fixture)?.click();
    fixture.detectChanges();
    expect(dialogRef.close).not.toHaveBeenCalledWith(true);
  });
});
