import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';
import { UserRole } from '../../../../core/models/user-role.enum';

type Role = 'admin' | 'doctor' | 'patient';

interface Action {
  label: string;
  description: string;
  icon: string;
  url: string;
}

interface DashboardContent {
  intro: string;
  actions: Action[];
}

const CONTENT: Record<string, DashboardContent> = {
  Admin: {
    intro: 'Manage doctors, patients and specializations.',
    actions: [
      {
        label: 'Doctors',
        description: 'Browse all doctors',
        icon: 'medical_services',
        url: '/portal/doctors',
      },
      {
        label: 'Patients',
        description: 'View registered patients',
        icon: 'groups',
        url: '/portal/patients',
      },
      {
        label: 'Specializations',
        description: 'Add and edit specializations',
        icon: 'category',
        url: '/portal/specializations',
      },
    ],
  },
  Doctor: {
    intro: 'Manage your availability and see your patients.',
    actions: [
      {
        label: 'Slots',
        description: 'Set your available times',
        icon: 'event_available',
        url: '/portal/slots',
      },
      {
        label: 'Patients',
        description: 'See who has booked with you',
        icon: 'groups',
        url: '/portal/patients',
      },
      {
        label: 'My account',
        description: 'View your profile',
        icon: 'person',
        url: '/portal/my-account',
      },
    ],
  },
  Patient: {
    intro: 'Find a doctor and book your next appointment.',
    actions: [
      {
        label: 'Find a doctor',
        description: 'Browse doctors by specialization',
        icon: 'search',
        url: '/portal/doctors',
      },
      {
        label: 'My account',
        description: 'View your profile',
        icon: 'person',
        url: '/portal/my-account',
      },
    ],
  },
};

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatIconModule],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
})
export class DashboardContainerComponent {
  private authService = inject(AuthService);
  role = signal<string>(this.authService.getRole());
  name = signal<string>(this.authService.getAuth()!.name);

  content = computed(() => CONTENT[this.role()]);
}
