import { Routes } from '@angular/router';
import { Login } from '../auth/login/login';
import { Register } from '../auth/register/register';

export const LANDING_PAGE_ROUTES: Routes = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
];
