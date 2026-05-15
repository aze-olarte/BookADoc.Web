import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPatientComponent } from './register-patient.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { provideRouter, Router } from '@angular/router';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { of, throwError } from 'rxjs';

describe('RegisterPatientComponent', () => {
  let component: RegisterPatientComponent;
  let fixture: ComponentFixture<RegisterPatientComponent>;
  let router: Router;

  let authServiceMock = {
    register: vi.fn(),
    storeAuth: vi.fn(),
  };

  let errorHandlerServiceMock = {
    applyFormErrors: vi.fn(),
  };

  let toastServiceMock = {
    success: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPatientComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: ToastService,
          useValue: toastServiceMock,
        },
        {
          provide: ErrorHandlerService,
          useValue: errorHandlerServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPatientComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    router = TestBed.inject(Router);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call register endpoint', async () => {
    const routerSpy = vi.spyOn(router, 'navigate');
    authServiceMock.register.mockReturnValue(of({}));
    component.fg.setValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Passw0rd$',
      confirmPassword: 'Passw0rd$',
    });
    component.submit();
    await fixture.whenStable();
    expect(authServiceMock.register).toHaveBeenCalled();
    expect(authServiceMock.storeAuth).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call register when the form is invalid', async () => {
    component.fg.setValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Passw0rd$',
      confirmPassword: 'Passw0rd',
    });
    component.submit();
    await fixture.whenStable();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should applyFormErrors on 422', () => {
    component.fg.setValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'test',
      confirmPassword: 'test',
    });

    authServiceMock.register.mockReturnValue(
      throwError(() => ({
        statusCode: 422,
        message: 'Invalid password format',
      })),
    );

    component.submit();
    expect(errorHandlerServiceMock.applyFormErrors).toHaveBeenCalled();
  });
});
