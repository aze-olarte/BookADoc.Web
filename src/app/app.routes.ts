import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'Book a Doc | Login',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Book a Doc | Register',
  },
];
