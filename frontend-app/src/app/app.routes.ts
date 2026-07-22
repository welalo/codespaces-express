import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginPageComponent } from './components/login-page/login-page';
import { ReservationsPageComponent } from './components/reservations-page/reservations-page';

export const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
  },
  {
    path: 'reservas',
    component: ReservationsPageComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
