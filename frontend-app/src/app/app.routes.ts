import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { LoginPageComponent } from './login-page';
import { ReservationsPageComponent } from './reservations-page';

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
