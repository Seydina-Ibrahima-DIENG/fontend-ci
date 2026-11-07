import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <div class="row row--between" style="margin-bottom: 24px">
          <div>
            <p class="page__eyebrow">Mon espace</p>
            <h1 class="page__title" style="margin: 0">Notifications</h1>
          </div>
          @if (liste().length > 0) {
            <button type="button" class="btn btn--ghost btn--small" (click)="toutesLues()">Tout marquer comme lu</button>
          }
        </div>

        @if (liste().length === 0) {
          <div class="empty"><p>Tu n'as aucune notification.</p></div>
        } @else {
          <ul class="liste">
            @for (n of liste(); track n.id) {
              <li class="card notif" [class.notif--nonlue]="!n.lue">
                <p class="notif__texte">{{ n.texte }}</p>
                <span class="muted notif__date">{{ n.date }}</span>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .notif { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .notif--nonlue { border-left: 4px solid var(--orange-500); }
    .notif__texte { margin: 0; font-weight: 500; }
    .notif__date { font-size: 13px; white-space: nowrap; }
  `,
})
export class NotificationsComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(NotificationService);

  protected readonly liste = computed(() => {
    const u = this.auth.courant();
    if (!u) return [];
    return this.service.notifications().filter((n) => n.userId === u.id).sort((a, b) => b.date.localeCompare(a.date));
  });

  protected toutesLues(): void {
    const u = this.auth.courant();
    if (u) this.service.marquerToutesLues(u.id);
  }
}
