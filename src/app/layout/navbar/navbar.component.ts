import { Component, computed, inject, signal } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [MatListModule, RouterLink, MatAnchor, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  role = computed(() => this.authService.user()?.role ?? '');
  activeLink = signal<string | null>(null);
  navItems = [
    {
      name: 'Dashboard',
      url: 'dashboard',
      canAccess: ['Admin', 'Patient', 'Doctor'],
    },
    {
      name: 'Patients',
      url: 'patients',
      canAccess: ['Admin', 'Doctor'],
    },
    {
      name: 'Doctors',
      url: 'doctors',
      canAccess: ['Admin', 'Patient'],
    },
    {
      name: 'Appointments',
      url: 'appointments',
      canAccess: ['Admin', 'Patient', 'Doctor'],
    },
    {
      name: 'Slots',
      url: 'slots',
      canAccess: ['Doctor'],
    },
    {
      name: 'Specializations',
      url: 'specializations',
      canAccess: ['Admin'],
    },
    {
      name: 'My Account',
      url: 'my-account',
      canAccess: ['Admin', 'Patient', 'Doctor'],
    },
  ];

  navItemsByRole = computed(() =>
    this.navItems.filter((item) => item.canAccess.includes(this.role())),
  );

  logout(): void {
    this.authService.logout();
  }
}
