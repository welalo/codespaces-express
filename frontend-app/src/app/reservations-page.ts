import { CommonModule } from '@angular/common';
import { computed, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PadelApiService, Reservation } from './services/padel-api.service';

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card action-card">
      <div class="top-actions">
        <h2><i class="fa-regular fa-calendar-check me-2"></i>Reservar pista</h2>
        <button class="btn btn-outline-light btn-sm" type="button" (click)="logout()">Desconectar</button>
      </div>

      <div class="row g-3 align-items-end">
        <div class="col-12">
          <label class="form-label">Día</label>
          <input
            class="form-control"
            [ngModel]="scheduleDate()"
            (ngModelChange)="scheduleDate.set($event)"
            type="date" />
        </div>
      </div>

      @if (message()) {
        <div class="message">{{ message() }}</div>
      }

      @if (toastVisible()) {
        <div class="toast-container position-fixed top-0 end-0 p-3">
          <div class="toast show align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">{{ toastMessage() }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Cerrar" (click)="toastVisible.set(false)"></button>
            </div>
          </div>
        </div>
      }

      <div class="calendar-grid mt-3">
        @for (courtNumber of courtOptions; track courtNumber) {
          <div class="calendar-column">
            <h4>Pista {{ courtNumber }}</h4>
            @for (slot of timeSlots; track slot) {
              <button
                class="slot-btn"
                type="button"
                [class.slot-reserved]="isSlotReserved(courtNumber, slot)"
                [class.slot-free]="!isSlotReserved(courtNumber, slot)"
                (click)="reserveSlot(courtNumber, slot)">
                <span>{{ slot }}</span>
                <small>{{ isSlotReserved(courtNumber, slot) ? 'Reservada' : 'Disponible' }}</small>
              </button>
            }
          </div>
        }
      </div>

      @if (reservations().length > 0) {
        <div class="reservations mt-3">
          <h3><i class="fa-solid fa-list me-2"></i>Reservas realizadas</h3>
          @for (reservation of reservations(); track reservation._id) {
            <div class="reservation-item">
              <span><strong>Pista {{ reservation.court }}</strong></span>
              <span>{{ reservation.startTime | date: 'short' }}</span>
              <span class="badge bg-light text-dark">{{ reservation.status }}</span>
              @if (reservation.user === loggedUserId()) {
                <button class="btn btn-outline-light btn-sm" type="button" (click)="cancelReservation(reservation._id)">Cancelar</button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .card { background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1rem; }
      .top-actions { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1rem; }
      .form-control, .form-select { margin-bottom: 0.8rem; }
      .calendar-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
      .calendar-column { background: rgba(15, 23, 42, 0.78); border-radius: 0.9rem; padding: 0.8rem; }
      .slot-btn { display:flex; justify-content:space-between; align-items:center; gap:0.5rem; border:none; border-radius:0.7rem; margin-bottom:0.4rem; padding:0.6rem; font-size:0.9rem; width: 100%; }
      .slot-free { background: rgba(34,197,94,0.18); color:#dcfce7; }
      .slot-reserved { background: rgba(248,113,113,0.2); color:#fee2e2; }
      .reservation-item { display:flex; flex-wrap:wrap; justify-content:space-between; gap:0.6rem; align-items:center; background: rgba(15, 23, 42, 0.9); border-radius:0.9rem; padding:0.85rem; margin-bottom:0.6rem; }
      .message { margin-top: 1rem; color: #86efac; font-weight: 600; }
      @media (max-width: 575.98px) { .top-actions { flex-direction: column; align-items: stretch; } .reservation-item { flex-direction: column; align-items: stretch; } }
    `,
  ],
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
