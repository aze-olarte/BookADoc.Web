import { Component, computed, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { MatAnchor } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  imports: [MatListModule, RouterLink, MatAnchor],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  role = signal<string>(this.authService.getRole());
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
      canAccess: ['Admin'],
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
    this.authService.clearAuth();
    this.router.navigate(['/login']);
  }
}
