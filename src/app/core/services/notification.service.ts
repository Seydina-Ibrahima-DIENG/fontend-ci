import { Injectable, computed, signal } from '@angular/core';
import { Notification } from '../models/models';

/** Notifications dans l'application (F6.1). Les emails (F6.2) viendront du backend. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([
    { id: 1, userId: 1, texte: 'Ta séance de Algorithmique avec Awa Sarr est confirmée.', date: '2026-11-07', lue: false },
    { id: 2, userId: 1, texte: 'Une réponse a été ajoutée à ta question sur les piles.', date: '2026-11-06', lue: true },
    { id: 3, userId: 2, texte: 'Nouvelle demande de séance de Ibou Fall en Bases de données.', date: '2026-11-07', lue: false },
    { id: 4, userId: 6, texte: 'Ta demande pour devenir tuteur est en cours de validation.', date: '2026-11-05', lue: true },
  ]);

  pour(userId: number) {
    return computed(() => this.notifications().filter((n) => n.userId === userId).sort((a, b) => b.date.localeCompare(a.date)));
  }

  nonLuesPour(userId: number): number {
    return this.notifications().filter((n) => n.userId === userId && !n.lue).length;
  }

  pousser(userId: number, texte: string): void {
    const id = Math.max(0, ...this.notifications().map((n) => n.id)) + 1;
    this.notifications.update((l) => [{ id, userId, texte, date: new Date().toISOString().slice(0, 10), lue: false }, ...l]);
  }

  marquerToutesLues(userId: number): void {
    this.notifications.update((l) => l.map((n) => (n.userId === userId ? { ...n, lue: true } : n)));
  }
}
