import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../auth/services/auth.service';
import { DashboardContainerComponent } from './dashboard-container.component';

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;

  async function setup(role: string, auth: { name: string } | null = { name: 'Jane Doe' }) {
    const authService = {
      getRole: vi.fn().mockReturnValue(role),
      getAuth: vi.fn().mockReturnValue(auth),
    };

    TestBed.overrideComponent(DashboardContainerComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [DashboardContainerComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('user details', () => {
    it('should create', async () => {
      await setup('Admin');

      expect(component).toBeTruthy();
    });

    it('should expose the role from the auth service', async () => {
      await setup('Doctor');

      expect(component.role()).toBe('Doctor');
    });

    it('should expose the name from the auth profile', async () => {
      await setup('Patient', { name: 'John Smith' });

      expect(component.name()).toBe('John Smith');
    });

    it('should throw on creation when there is no auth profile', async () => {
      await expect(setup('Admin', null)).rejects.toThrow();
    });
  });

  describe('content per role', () => {
    const expected = [
      {
        role: 'Admin',
        intro: 'Manage doctors, patients and specializations.',
        actions: [
          ['Doctors', '/portal/doctors'],
          ['Patients', '/portal/patients'],
          ['Specializations', '/portal/specializations'],
        ],
      },
      {
        role: 'Doctor',
        intro: 'Manage your availability and see your patients.',
        actions: [
          ['Slots', '/portal/slots'],
          ['Patients', '/portal/patients'],
          ['My account', '/portal/my-account'],
        ],
      },
      {
        role: 'Patient',
        intro: 'Find a doctor and book your next appointment.',
        actions: [
          ['Find a doctor', '/portal/doctors'],
          ['My account', '/portal/my-account'],
        ],
      },
    ];

    it.each(expected)('should show the $role intro', async ({ role, intro }) => {
      await setup(role);

      expect(component.content().intro).toBe(intro);
    });

    it.each(expected)(
      'should show the $role actions with their links',
      async ({ role, actions }) => {
        await setup(role);

        expect(component.content().actions.map((a) => [a.label, a.url])).toEqual(actions);
      },
    );

    it.each(['Admin', 'Doctor', 'Patient'])(
      'should give every %s action a label, description, icon and portal link',
      async (role) => {
        await setup(role);

        for (const action of component.content().actions) {
          expect(action.label).not.toBe('');
          expect(action.description).not.toBe('');
          expect(action.icon).not.toBe('');
          expect(action.url).toMatch(/^\/portal\//);
        }
      },
    );

    it('should only let admins reach the specializations page from the dashboard', async () => {
      for (const role of ['Doctor', 'Patient']) {
        TestBed.resetTestingModule();
        await setup(role);

        const urls = component.content().actions.map((a) => a.url);
        expect(urls).not.toContain('/portal/specializations');
      }
    });

    it('should not offer patients the patient list', async () => {
      await setup('Patient');

      const urls = component.content().actions.map((a) => a.url);
      expect(urls).not.toContain('/portal/patients');
    });
  });

  describe('content()', () => {
    it('should update when the role signal changes', async () => {
      await setup('Admin');

      component.role.set('Patient');

      expect(component.content().intro).toBe('Find a doctor and book your next appointment.');
    });

    it('should be undefined for an unrecognised role', async () => {
      await setup('Receptionist');

      expect(component.content()).toBeUndefined();
    });
  });
});
