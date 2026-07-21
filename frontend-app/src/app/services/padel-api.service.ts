import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Reservation {
  _id: string;
  user: string;
  court: number;
  startTime: string;
  endTime: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PadelApiService {
  private readonly apiUrl = window.location.origin;

  constructor(private readonly http: HttpClient) {}

  register(payload: { name: string; email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/register`, payload);
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, payload);
  }

  getReservations(token: string) {
    return this.http.get<Reservation[]>(`${this.apiUrl}/api/reservations`, {
      headers: this.getAuthHeaders(token),
    });
  }

  createReservation(payload: { court: number; startTime: string }, token: string) {
    return this.http.post<{ message: string; reservation: Reservation }>(
      `${this.apiUrl}/api/reservations`,
      payload,
      {
        headers: this.getAuthHeaders(token),
      }
    );
  }

  cancelReservation(id: string, token: string) {
    return this.http.patch<{ message: string; reservation: Reservation }>(
      `${this.apiUrl}/api/reservations/${id}/cancel`,
      {},
      {
        headers: this.getAuthHeaders(token),
      }
    );
  }

  private getAuthHeaders(token: string) {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
