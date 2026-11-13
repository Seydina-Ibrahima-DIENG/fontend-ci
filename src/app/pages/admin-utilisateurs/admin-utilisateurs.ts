import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CandidatureTuteurResponse } from '../../core/api/api';
import { AuthService } from '../../core/services/auth.service';
import { CandidatureService } from '../../core/services/candidature.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AdminNavComponent } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-utilisateurs',
  imports: [FormsModule, AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />
        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Utilisateurs</h1>

        @if (message()) { <p class="alert alert--info" style="margin-top: 16px" role="status">{{ message() }}</p> }
        @if (erreur()) { <p class="alert alert--erreur" style="margin-top: 16px" role="alert">{{ erreur() }}</p> }

        <h2 class="h2" style="margin-top: 32px">Candidatures pour devenir tuteur ({{ candidatures().length }})</h2>
        @if (candidatures().length === 0) {
          <div class="empty"><p>Aucune candidature en attente.</p></div>
        } @else {
          <ul class="liste">
            @for (c of candidatures(); track c.id) {
              <li class="card demande">
                <div class="demande__infos">
                  <strong>{{ c.prenom }} {{ c.nom }}</strong>
                  <p class="muted">{{ c.email }}</p>
                  <p class="muted">Présentation : {{ c.description }}</p>
                  <p class="muted">Motivation : {{ c.motivation }}</p>
                </div>
                <div class="row">
                  <button type="button" class="btn btn--primary btn--small" (click)="approuver(c.id)">Approuver</button>
                  @if (refusId() !== c.id) {
                    <button type="button" class="btn btn--danger btn--small" (click)="refusId.set(c.id)">Refuser</button>
                  } @else {
                    <input name="motif-{{ c.id }}" placeholder="Motif du refus" [(ngModel)]="motif" />
                    <button type="button" class="btn btn--danger btn--small" [disabled]="!motif.trim()" (click)="refuser(c.id)">Confirmer</button>
                  }
                </div>
              </li>
            }
          </ul>
        }

        <h2 class="h2" style="margin-top: 40px">Comptes ({{ utilisateurs.utilisateurs().length }})</h2>
        <div class="card" style="overflow-x: auto">
          <table class="table">
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr>
            </thead>
            <tbody>
              @for (u of utilisateurs.utilisateurs(); track u.id) {
                <tr>
                  <td>{{ u.nom }}</td>
                  <td class="muted">{{ u.email }}</td>
                  <td>{{ roleLabel(u.role) }}</td>
                  <td><span class="badge" [class.badge--danger]="u.statut === 'suspendu'">{{ statutLabel(u.statut) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .demande { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
    .demande__infos { min-width: 0; flex: 1 1 320px; }
    .demande__infos p { margin: 4px 0 0; }
  `,
})
export class AdminUtilisateursComponent {
  protected readonly utilisateurs = inject(UtilisateurService);
  private readonly auth = inject(AuthService);
  private readonly candidatureService = inject(CandidatureService);

  protected readonly message = signal<string | null>(null);
  protected readonly erreur = signal<string | null>(null);
  protected readonly candidatures = signal<CandidatureTuteurResponse[]>([]);
  protected readonly refusId = signal<number | null>(null);
  protected motif = '';

  protected readonly moiId = computed(() => this.auth.courant()?.id ?? -1);

  constructor() {
    void this.utilisateurs.chargerComptes();
    void this.recharger();
  }

  protected roleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : role === 'tuteur' ? 'Tuteur' : 'Étudiant';
  }

  protected statutLabel(statut: string): string {
    const map: Record<string, string> = { actif: 'Actif', suspendu: 'Suspendu', en_attente: 'En attente', inactif: 'Inactif' };
    return map[statut] ?? statut;
  }

  protected async approuver(id: number): Promise<void> {
    const msg = await this.candidatureService.approuver(id);
    this.afficher(msg, 'Candidature approuvée : le rôle tuteur sera actif à la prochaine connexion.');
  }

  protected async refuser(id: number): Promise<void> {
    const motif = this.motif.trim();
    this.refusId.set(null);
    this.motif = '';
    const msg = await this.candidatureService.refuser(id, motif);
    this.afficher(msg, 'Candidature refusée.');
  }

  private afficher(erreur: string | null, succes: string): void {
    this.erreur.set(erreur);
    this.message.set(erreur ? null : succes);
    void this.recharger();
  }

  private async recharger(): Promise<void> {
    this.candidatures.set(await this.candidatureService.enAttente());
  }
}
