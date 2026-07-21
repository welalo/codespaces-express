import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PadelApiService } from './services/padel-api.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forms-grid row g-3">
      <form class="card col-12 col-lg-6" (ngSubmit)="isRegisterMode ? register() : login()">
        <h2>
          <i class="fa-solid" [ngClass]="isRegisterMode ? 'fa-user-plus me-2' : 'fa-right-to-bracket me-2'"></i>
          {{ isRegisterMode ? 'Registro' : 'Acceder' }}
        </h2>

        <input *ngIf="isRegisterMode" class="form-control" [(ngModel)]="authForm.name" name="name" placeholder="Nombre" required />
        <input class="form-control" [(ngModel)]="authForm.email" name="email" placeholder="Email" type="email" required />
        <input class="form-control" [(ngModel)]="authForm.password" name="password" placeholder="Password" type="password" required />

        <button class="btn btn-primary" type="submit">
          {{ isRegisterMode ? 'Registrarme' : 'Entrar' }}
        </button>

        <div class="mt-3 d-flex flex-wrap gap-2">
          <button class="btn btn-link text-white-50 p-0" type="button" (click)="toggleMode()">
            <i class="fa-solid" [ngClass]="isRegisterMode ? 'fa-right-to-bracket me-2' : 'fa-user-plus me-2'"></i>
            {{ isRegisterMode ? 'Ya tengo cuenta' : 'Registrarse' }}
          </button>
        </div>
      </form>
    </div>

    <div class="message" *ngIf="message">{{ message }}</div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
      }

      .forms-grid {
        display: grid;
        place-items: center;
        min-height: calc(100vh - 180px);
      }

      .card {
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 1rem;
        padding: 1rem;
        max-width: 460px;
        width: 100%;
        margin: 0 auto;
      }

      .form-control { margin-bottom: 0.8rem; }
      .btn-primary { background: linear-gradient(135deg, #22c55e, #16a34a); border: none; font-weight: 600; }
      .btn-link { text-decoration: none; }
      .message { margin-top: 1rem; color: #86efac; font-weight: 600; text-align: center; }
    `,
  ],
})
export class LoginPageComponent {
  authForm = { name: '', email: '', password: '' };
  message = '';
  isRegisterMode = false;

  constructor(private readonly api: PadelApiService, private readonly router: Router) {}

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.message = '';
  }

  register(): void {
    this.api.register(this.authForm).subscribe({
      next: (res) => {
        localStorage.setItem('padel-token', res.token);
        localStorage.setItem('padel-user-id', res.user.id);
        this.message = res.message;
        this.router.navigateByUrl('/reservas');
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al registrar';
      },
    });
  }

  login(): void {
    this.api.login({ email: this.authForm.email, password: this.authForm.password }).subscribe({
      next: (res) => {
        localStorage.setItem('padel-token', res.token);
        localStorage.setItem('padel-user-id', res.user.id);
        this.message = res.message;
        this.router.navigateByUrl('/reservas');
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al iniciar sesión';
      },
    });
  }
}
