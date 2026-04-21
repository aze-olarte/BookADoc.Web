import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component/login.component';
import { RegisterComponent } from './features/auth/register.component/register.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'Book a Doc | Login',
  },
  {
    path: '',
    component: RegisterComponent,
    title: 'Book a Doc | Register',
  },
];
