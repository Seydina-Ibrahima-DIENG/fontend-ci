import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <div class="row row--between" style="margin-bottom: 24px">
          <div>
            <p class="page__eyebrow">Mon espace</p>
            <h1 class="page__title" style="margin: 0">Notifications</h1>
          </div>
          @if (service.notifications().length > 0) {
            <button type="button" class="btn btn--ghost btn--small" (click)="toutesLues()">Tout marquer comme lu</button>
          }
        </div>

        @if (service.notifications().length === 0) {
          <div class="empty"><p>Tu n'as aucune notification.</p></div>
        } @else {
          <ul class="liste">
            @for (n of service.notifications(); track n.id) {
              <li class="card notif" [class.notif--nonlue]="!n.lu">
                <div>
                  <p class="notif__titre"><strong>{{ n.titre }}</strong></p>
                  <p class="notif__texte">{{ n.message }}</p>
                  <span class="muted notif__date">{{ n.dateCreation | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                @if (!n.lu) {
                  <button type="button" class="btn btn--ghost btn--small" (click)="marquerLue(n.id)">Marquer lue</button>
                }
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .notif { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
    .notif--nonlue { border-left: 4px solid var(--orange-500); }
    .notif__titre { margin: 0 0 4px; }
    .notif__texte { margin: 0 0 6px; font-weight: 500; }
    .notif__date { font-size: 13px; white-space: nowrap; }
  `,
})
export class NotificationsComponent {
  protected readonly service = inject(NotificationService);
  private readonly auth = inject(AuthService);

  protected async marquerLue(id: number): Promise<void> {
    const u = this.auth.courant();
    if (u) await this.service.marquerLue(id, u.id);
  }

  protected async toutesLues(): Promise<void> {
    const u = this.auth.courant();
    if (u) await this.service.toutesLues(u.id);
  }
}
