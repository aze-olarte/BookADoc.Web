import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from '../../../../core/models/user-role.enum';
import { RegisterRoleComponent } from './register-role.component';

describe('RegisterRoleComponent', () => {
  let component: RegisterRoleComponent;

  beforeEach(async () => {
    TestBed.overrideComponent(RegisterRoleComponent, {
      set: { template: '', imports: [] },
    });

    await TestBed.configureTestingModule({
      imports: [RegisterRoleComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('options', () => {
    it('should offer Patient and Doctor, in that order', () => {
      expect(component.options()).toEqual([UserRole.Patient, UserRole.Doctor]);
    });

    it('should not offer the Admin role', () => {
      expect(component.options()).not.toContain('Admin' as UserRole);
    });
  });

  describe('selectedOption', () => {
    it('should default to Patient', () => {
      expect(component.selectedOption()).toBe(UserRole.Patient);
    });

    it('should be one of the offered options by default', () => {
      expect(component.options()).toContain(component.selectedOption());
    });

    it('should update when another role is selected', () => {
      component.selectedOption.set(UserRole.Doctor);

      expect(component.selectedOption()).toBe(UserRole.Doctor);
    });
  });

  describe('redirectLink', () => {
    it('should point to the patient registration by default', () => {
      expect(component.redirectLink()).toBe(UserRole.Patient.toLowerCase());
    });

    it('should point to the doctor registration when Doctor is selected', () => {
      component.selectedOption.set(UserRole.Doctor);

      expect(component.redirectLink()).toBe(UserRole.Doctor.toLowerCase());
    });

    it('should switch back when Patient is selected again', () => {
      component.selectedOption.set(UserRole.Doctor);
      component.selectedOption.set(UserRole.Patient);

      expect(component.redirectLink()).toBe(UserRole.Patient.toLowerCase());
    });

    it('should be lower-case and contain no spaces or slashes', () => {
      for (const role of component.options()) {
        component.selectedOption.set(role);

        expect(component.redirectLink()).toMatch(/^[a-z-]+$/);
      }
    });
  });
});
