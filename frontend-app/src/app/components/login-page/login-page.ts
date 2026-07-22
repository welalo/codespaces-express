import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PadelApiService } from '../../services/padel-api.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPageComponent {

  private readonly api = inject(PadelApiService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  authForm = {
    name: '',
    email: '',
    password: ''
  };

  readonly isRegisterMode = signal(false);

  toggleMode(): void {
    this.isRegisterMode.update(v => !v);
  }

  register(): void {
    this.api.register(this.authForm).subscribe({
      next: ({ token, user, message }) => {
        localStorage.setItem('padel-token', token);
        localStorage.setItem('padel-user-id', user.id);

        this.messageService.showToast(message);
        this.router.navigateByUrl('/reservas');
      },
      error: ({ error }) => {
        this.messageService.showToast(error?.message ?? 'Error al registrar');
      }
    });
  }

  login(): void {
    this.api.login({
      email: this.authForm.email,
      password: this.authForm.password
    }).subscribe({
      next: ({ token, user, message }) => {
        localStorage.setItem('padel-token', token);
        localStorage.setItem('padel-user-id', user.id);

        this.messageService.showToast(message);
        this.router.navigateByUrl('/reservas');
      },
      error: ({ error }) => {
        this.messageService.showToast(error?.message ?? 'Error al iniciar sesión');
      }
    });
  }
}