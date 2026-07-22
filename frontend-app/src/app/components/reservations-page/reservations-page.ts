import { CommonModule } from '@angular/common';
import { computed, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PadelApiService, Reservation } from '../../services/padel-api.service';

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations-page.html',
  styleUrl: './reservations-page.css'
})
export class ReservationsPageComponent implements OnInit {
  readonly token = signal('');
  readonly loggedUserId = signal('');
  readonly message = signal('');
  readonly toastVisible = signal(false);
  readonly toastMessage = signal('');
  readonly reservations = signal<Reservation[]>([]);
  readonly scheduleDate = signal(new Date().toISOString().slice(0, 10));
  readonly courtOptions = [1, 2, 3];
  readonly timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  readonly filteredReservations = computed(() => {
    const selectedDay = this.scheduleDate();

    return this.reservations().filter((reservation) => {
      const reservationDate = new Date(reservation.startTime).toISOString().slice(0, 10);
      return reservationDate === selectedDay;
    });
  });

  constructor(private readonly api: PadelApiService, private readonly router: Router) {}

  ngOnInit(): void {
    this.token.set(localStorage.getItem('padel-token') || '');
    this.loggedUserId.set(localStorage.getItem('padel-user-id') || '');

    if (!this.token()) {
      this.message.set('Debes iniciar sesión primero');
      return;
    }

    this.loadReservations();
  }

  loadReservations(): void {
    this.api.getReservations(this.token()).subscribe({
      next: (res) => {
        this.reservations.set(res);
      },
      error: () => {
        this.message.set('No se pudieron cargar las reservas');
      },
    });
  }

  logout(): void {
    localStorage.removeItem('padel-token');
    localStorage.removeItem('padel-user-id');
    this.token.set('');
    this.loggedUserId.set('');
    this.message.set('');
    this.router.navigateByUrl('/');
  }

  reserveSlot(courtNumber: number, slot: string): void {
    const startTime = this.getUtcSlotDateTime(slot);

    this.api.createReservation({ court: courtNumber, startTime }, this.token()).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.showToast(res.message);
        this.loadReservations();
      },
      error: (err) => {
        this.message.set(err.error?.message || 'No se pudo reservar');
        this.showToast(err.error?.message || 'No se pudo reservar');
      },
    });
  }

  cancelReservation(id: string): void {
    this.api.cancelReservation(id, this.token()).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.showToast(res.message);
        this.loadReservations();
      },
      error: (err) => {
        this.message.set(err.error?.message || 'No se pudo cancelar');
        this.showToast(err.error?.message || 'No se pudo cancelar');
      },
    });
  }

  isSlotReserved(court: number, slot: string): boolean {
    const slotToCompare = this.getUtcSlotDateTime(slot);

    return this.filteredReservations().some((reservation) => {
      if (reservation.court !== court || reservation.status !== 'confirmed') {
        return false;
      }

      return new Date(reservation.startTime).toISOString() === slotToCompare;
    });
  }

  private getUtcSlotDateTime(slot: string): string {
    const localDate = new Date(`${this.scheduleDate()}T${slot}:00`);
    return localDate.toISOString();
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    window.setTimeout(() => {
      this.toastVisible.set(false);
    }, 2500);
  }
}
