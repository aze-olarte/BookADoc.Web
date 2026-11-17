import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject } from 'rxjs';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { MyAccountComponent } from './my-account.component';

describe('MyAccountComponent', () => {
  let authService: { getMyDetails: Mock };

  const userDetails = { id: 1, name: 'Jane Doe', balance: 1500 };

  async function setup(details$: Observable<unknown>) {
    authService = { getMyDetails: vi.fn().mockReturnValue(details$) };

    TestBed.overrideComponent(MyAccountComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [MyAccountComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyAccountComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should create', async () => {
    const component = await setup(of(userDetails));

    expect(component).toBeTruthy();
  });

  it('should request the account details once on creation', async () => {
    await setup(of(userDetails));

    expect(authService.getMyDetails).toHaveBeenCalledTimes(1);
  });

  it('should expose null while the request is pending', async () => {
    const component = await setup(new Subject<unknown>());

    expect(component.user()).toBeNull();
  });

  it('should expose the user details once the request resolves', async () => {
    const details$ = new Subject<unknown>();
    const component = await setup(details$);

    details$.next(userDetails);

    expect(component.user()).toEqual(userDetails);
  });

  it('should expose the details immediately when the service emits synchronously', async () => {
    const component = await setup(of(userDetails));

    expect(component.user()).toEqual(userDetails);
  });

  it('should rethrow the error when the signal is read after the request fails', async () => {
    const details$ = new Subject<unknown>();
    const component = await setup(details$);

    details$.error(new Error('Unauthorized'));

    expect(() => component.user()).toThrow('Unauthorized');
  });
});
