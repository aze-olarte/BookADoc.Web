import { Routes } from '@angular/router';

export const routes: Routes = [
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
      import('./features/doctors/components/doctors-list/doctors-list.component').then(
        (m) => m.DoctorsListComponent,
      ),
    title: 'Book a Doc | List of Doctors',
  },
  {
    path: 'doctors/:id',
    loadComponent: () =>
      import('./features/doctors/components/doctors-profile/doctors-profile.component').then(
        (m) => m.DoctorsProfileComponent,
      ),
    title: 'Book a Doc | Doctor Profile',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
