import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { RegisterDoctorComponent } from './register-doctor.component';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { of, throwError } from 'rxjs';
import { SpecializationService } from '../../../../core/services/specialization.service';

describe('RegisterDoctorComponent', () => {
  let component: RegisterDoctorComponent;
  let fixture: ComponentFixture<RegisterDoctorComponent>;
  let router: Router;

  let authServiceMock = {
    register: vi.fn(),
    storeAuth: vi.fn(),
  };
  let toastServiceMock = {
    success: vi.fn(),
  };

  let errorHandlerServiceMock = {
    applyFormErrors: vi.fn(),
  };

  let specializationServiceMock = {
    getAll: vi.fn().mockReturnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterDoctorComponent],
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
        {
          provide: SpecializationService,
          useValue: specializationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDoctorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    router = TestBed.inject(Router);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set specializationOptions', () => {
    specializationServiceMock.getAll.mockReturnValue(of([{ id: 1, name: 'Pediatrics' }]));
    component.getSpecializationOptions();
    fixture.detectChanges();
    expect(component.specializationOptions().length).not.toBe(0);
  });

  it('should call register endpoint', async () => {
    const routerSpy = vi.spyOn(router, 'navigate');
    authServiceMock.register.mockReturnValue(of({}));
    component.fg.setValue({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Passw0rd$',
      confirmPassword: 'Passw0rd$',
      licenseNumber: '123-ABC',
      consultationFee: 10.2,
      specializationId: 1,
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
      confirmPassword: 'Passw0rd$',
      licenseNumber: '',
      consultationFee: 10.2,
      specializationId: 1,
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
      licenseNumber: '123-AB',
      consultationFee: 10.2,
      specializationId: 1,
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
