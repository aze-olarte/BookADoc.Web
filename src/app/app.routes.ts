import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterPatientComponent } from './features/auth/pages/register-patient/register-patient.component';
import { RegisterRoleComponent } from './features/auth/pages/register-role/register-role.component';
import { RegisterDoctorComponent } from './features/auth/pages/register-doctor/register-doctor.component';
import { DoctorsListComponent } from './features/doctors/components/doctors-list/doctors-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'Book a Doc | Login',
  },
  {
    path: 'register',
    component: RegisterRoleComponent,
    title: 'Book a Doc | Register',
  },
  {
    path: 'register/patient',
    component: RegisterPatientComponent,
    title: 'Book a Doc | Register as a Patient',
  },
  {
    path: 'register/doctor',
    component: RegisterDoctorComponent,
    title: 'Book a Doc | Register as a Doctor',
  },
  {
    path: 'doctors',
    component: DoctorsListComponent,
    title: 'Book a Doc | List of Doctors',
  },
];
