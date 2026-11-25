import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { AuthService } from '../../features/auth/services/auth.service';
import { NavbarComponent } from './navbar.component';

type TestUser = { role: string } | null;

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let user: ReturnType<typeof signal<TestUser>>;
  let authService: { user: typeof user; logout: Mock };

  async function setup(role: string | null) {
    user = signal<TestUser>(role === null ? null : { role });
    authService = { user, logout: vi.fn() };

    TestBed.overrideComponent(NavbarComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const visibleNames = () => component.navItemsByRole().map((i) => i.name);

  describe('initial state', () => {
    it('should create', async () => {
      await setup('Admin');

      expect(component).toBeTruthy();
    });

    it('should have no active link', async () => {
      await setup('Admin');

      expect(component.activeLink()).toBeNull();
    });

    it('should define a unique url for every nav item', async () => {
      await setup('Admin');

      const urls = component.navItems.map((i) => i.url);
      expect(new Set(urls).size).toBe(urls.length);
    });
  });

  describe('role', () => {
    it.each(['Admin', 'Doctor', 'Patient'])(
      'should expose the %s role from the signed-in user',
      async (role) => {
        await setup(role);

        expect(component.role()).toBe(role);
      },
    );

    it('should fall back to an empty role when no user is signed in', async () => {
      await setup(null);

      expect(component.role()).toBe('');
    });
  });

  describe('navItemsByRole', () => {
    it('should show the Admin items', async () => {
      await setup('Admin');

      expect(visibleNames()).toEqual([
        'Dashboard',
        'Patients',
        'Doctors',
        'Appointments',
        'Specializations',
        'My Account',
      ]);
    });

    it('should show the Doctor items', async () => {
      await setup('Doctor');

      expect(visibleNames()).toEqual([
        'Dashboard',
        'Patients',
        'Appointments',
        'Slots',
        'My Account',
      ]);
    });

    it('should show the Patient items', async () => {
      await setup('Patient');

      expect(visibleNames()).toEqual(['Dashboard', 'Doctors', 'Appointments', 'My Account']);
    });

    it('should show nothing for an unrecognised role', async () => {
      await setup('Receptionist');

      expect(visibleNames()).toEqual([]);
    });

    it('should show nothing when no user is signed in', async () => {
      await setup(null);

      expect(visibleNames()).toEqual([]);
    });

    it('should only let admins see Specializations', async () => {
      for (const role of ['Doctor', 'Patient']) {
        TestBed.resetTestingModule();
        await setup(role);

        expect(visibleNames()).not.toContain('Specializations');
      }
    });

    it('should only let doctors see Slots', async () => {
      for (const role of ['Admin', 'Patient']) {
        TestBed.resetTestingModule();
        await setup(role);

        expect(visibleNames()).not.toContain('Slots');
      }
    });

    it('should keep the original item objects and order', async () => {
      await setup('Patient');

      expect(component.navItemsByRole()).toEqual(
        component.navItems.filter((i) => i.canAccess.includes('Patient')),
      );
    });

    it('should update when the signed-in user changes', async () => {
      await setup('Patient');

      user.set({ role: 'Doctor' });

      expect(component.role()).toBe('Doctor');
      expect(visibleNames()).toContain('Slots');
      expect(visibleNames()).not.toContain('Doctors');
    });

    it('should empty out when the user signs out', async () => {
      await setup('Admin');

      user.set(null);

      expect(visibleNames()).toEqual([]);
    });
  });

  describe('activeLink', () => {
    it('should be writable', async () => {
      await setup('Admin');

      component.activeLink.set('patients');

      expect(component.activeLink()).toBe('patients');
    });
  });

  describe('logout()', () => {
    it('should delegate to the auth service', async () => {
      await setup('Admin');

      component.logout();

      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });
});
