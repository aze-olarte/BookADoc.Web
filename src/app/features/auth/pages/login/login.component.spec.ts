import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const authServiceMock = {
    login: vi.fn(),
    storeAuth: vi.fn(),
  };

  const errorHandlerServiceMock = {
    applyFormErrors: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    router = TestBed.inject(Router);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login endpoint', async () => {
    const routerSpy = vi.spyOn(router, 'navigate');
    authServiceMock.login.mockReturnValue(of({}));
    component.fg.setValue({
      email: 'johndoe@example.com',
      password: 'johnDo321',
    });
    component.submit();
    await fixture.whenStable();
    expect(authServiceMock.login).toHaveBeenCalled();
    expect(authServiceMock.storeAuth).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/portal/dashboard']);
  });

  it('should not call login when the form is invalid', async () => {
    component.fg.setValue({
      email: 'johndoe',
      password: '',
    });

    component.submit();
    await fixture.whenStable();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should applyFormErrors on 422', () => {
    component.fg.setValue({
      email: 'johndoe@example.com',
      password: 'johnDo321',
    });

    authServiceMock.login.mockReturnValue(
      throwError(() => ({
        statusCode: 422,
        message: 'Validation Failed.',
      })),
    );
    component.submit();

    expect(errorHandlerServiceMock.applyFormErrors).toHaveBeenCalled();
  });
});
