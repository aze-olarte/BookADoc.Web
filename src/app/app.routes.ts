import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { LayoutComponent } from './layout/layout/layout.component';
import { roleGuard } from './core/guards/role-guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
        title: 'Book a Doc | Login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register-role/register-role.component').then(
            (m) => m.RegisterRoleComponent,
          ),
        title: 'Book a Doc | Register',
      },
      {
        path: 'register/patient',
        loadComponent: () =>
          import('./features/auth/pages/register-patient/register-patient.component').then(
            (m) => m.RegisterPatientComponent,
          ),
        title: 'Book a Doc | Register as a Patient',
      },
      {
        path: 'register/doctor',
        loadComponent: () =>
          import('./features/auth/pages/register-doctor/register-doctor.component').then(
            (m) => m.RegisterDoctorComponent,
          ),
        title: 'Book a Doc | Register as a Doctor',
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/doctors/pages/doctors-list/doctors-list.component').then(
            (m) => m.DoctorsListComponent,
          ),
        title: 'Book a Doc | List of Doctors',
      },
      {
        path: 'doctors/:id',
        loadComponent: () =>
          import('./features/doctors/pages/doctors-profile/doctors-profile.component').then(
            (m) => m.DoctorsProfileComponent,
          ),
        title: 'Book a Doc | Doctor Profile',
      },
    ],
  },
  {
    path: 'portal',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-container/dashboard-container.component').then(
            (m) => m.DashboardContainerComponent,
          ),
        title: 'Book A Doc | Dashboard',
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/doctors/pages/doctors-list/doctors-list.component').then(
            (m) => m.DoctorsListComponent,
          ),
        title: 'Book A Doc | Doctors',
        canActivate: [roleGuard],
      },
      {
        path: 'doctors/:id',
        loadComponent: () =>
          import('./features/doctors/pages/doctors-profile/doctors-profile.component').then(
            (m) => m.DoctorsProfileComponent,
          ),
        title: 'Book A Doc | Doctors',
        canActivate: [roleGuard],
      },
      {
        path: 'specializations',
        loadComponent: () =>
          import('./features/specializations/pages/specializations-list/specializations-list.component').then(
            (m) => m.SpecializationsListComponent,
          ),
        title: 'Book A Doc | Specializations',
        canActivate: [roleGuard],
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patients/pages/patients-list/patients-list.component').then(
            (m) => m.PatientsListComponent,
          ),
        title: 'Book A Doc | Patients',
        canActivate: [roleGuard],
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/pages/appointments-list/appointments-list.component').then(
            (m) => m.AppointmentsListComponent,
          ),
        title: 'Book A Doc | Appointments',
        canActivate: [roleGuard],
      },
      {
        path: 'appointments/:id',
        loadComponent: () =>
          import('./features/appointments/pages/appointments-details/appointments-details.component').then(
            (m) => m.AppointmentsDetailsComponent,
          ),
        title: 'Book A Doc | Appointments',
        canActivate: [roleGuard],
      },
      {
        path: 'slots',
        loadComponent: () =>
          import('./features/slots/pages/slot-views/slot-views.component').then(
            (m) => m.SlotViewsComponent,
          ),
        title: 'Book A Doc | Slots',
        canActivate: [roleGuard],
      },
      {
        path: 'my-account',
        loadComponent: () =>
          import('./features/auth/pages/my-account/my-account.component').then(
            (m) => m.MyAccountComponent,
          ),
        title: 'Book A Doc | Slots',
        canActivate: [roleGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  //

  {
    path: '**',
    redirectTo: 'login',
  },
];
