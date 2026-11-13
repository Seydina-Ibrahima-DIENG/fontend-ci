import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE, NotificationApi } from '../api/api';

/** Notifications dans l'application (F6.1), notification-service. Les emails (F6.2) restent à brancher. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  /** Notifications de l'utilisateur connecté, les plus récentes d'abord. */
  readonly notifications = signal<NotificationApi[]>([]);

  readonly nonLues = computed(() => this.notifications().filter((n) => !n.lu).length);

  /** Recharge les notifications d'un utilisateur. */
  async charger(userId: number): Promise<void> {
    try {
      const liste = await firstValueFrom(
        this.http.get<NotificationApi[]>(`${API_BASE}/notifications/utilisateur/${userId}`),
      );
      this.notifications.set(liste);
    } catch {
      this.notifications.set([]);
    }
  }

  /** Vide la liste locale (déconnexion). */
  vider(): void {
    this.notifications.set([]);
  }

  async marquerLue(id: number, userId: number): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(`${API_BASE}/notifications/${id}/lue`, null));
    } finally {
      await this.charger(userId);
    }
  }

  async toutesLues(userId: number): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(`${API_BASE}/notifications/utilisateur/${userId}/tout-lire`, null));
    } finally {
      await this.charger(userId);
    }
  }
}
