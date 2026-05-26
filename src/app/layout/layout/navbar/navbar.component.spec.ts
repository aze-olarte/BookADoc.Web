import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../features/auth/services/auth.service';
import { provideRouter, Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock = {
    getRole: vi.fn().mockReturnValue('Patient'),
    clearAuth: vi.fn(),
  };
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    router = TestBed.inject(Router);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter the list of nav items based on role', () => {
    expect(component.navItemsByRole().length).toBe(4);
  });

  it('should logout', () => {
    const routerSpy = vi.spyOn(router, 'navigate');
    component.logout();
    expect(authServiceMock.clearAuth).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });
});
