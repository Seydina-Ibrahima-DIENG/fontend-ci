import { Component, computed, inject, signal } from '@angular/core';
import { AdminNavComponent } from '../admin-nav/admin-nav';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-utilisateurs',
  imports: [AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />
        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Utilisateurs</h1>

        <h2 class="h2" style="margin-top: 32px">Demandes pour devenir tuteur ({{ demandes().length }})</h2>
        @if (demandes().length === 0) {
          <div class="empty"><p>Aucune demande en attente.</p></div>
        } @else {
          <ul class="liste">
            @for (u of demandes(); track u.id) {
              <li class="card demande">
                <div class="demande__infos">
                  <strong>{{ u.nom }}</strong>
                  <p class="muted">{{ u.niveau }} · {{ u.filiere }}</p>
                  <p class="muted">Matières : {{ u.matieres.join(', ') || '—' }}</p>
                  @if (u.description) { <p class="muted">« {{ u.description }} »</p> }
                  @if (u.justificatif) { <p class="muted">Justificatif : {{ u.justificatif }}</p> }
                </div>
                <div class="row">
                  <button type="button" class="btn btn--primary btn--small" (click)="decider(u.id, 'validee')">Valider</button>
                  <button type="button" class="btn btn--danger btn--small" (click)="decider(u.id, 'refusee')">Refuser</button>
                </div>
              </li>
            }
          </ul>
        }

        <h2 class="h2" style="margin-top: 40px">Comptes</h2>
        <div class="card" style="overflow-x: auto">
          <table class="table">
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              @for (u of utilisateurs(); track u.id) {
                <tr>
                  <td>{{ u.nom }}</td>
                  <td class="muted">{{ u.email }}</td>
                  <td>{{ roleLabel(u.role) }}</td>
                  <td>
                    <span class="badge" [class.badge--danger]="u.statut === 'suspendu'">{{ u.statut === 'actif' ? 'Actif' : 'Suspendu' }}</span>
                  </td>
                  <td>
                    @if (u.id !== moiId()) {
                      <div class="row" style="flex-wrap: nowrap">
                        <button type="button" class="btn btn--ghost btn--small" (click)="basculerStatut(u.id)">
                          {{ u.statut === 'actif' ? 'Suspendre' : 'Réactiver' }}
                        </button>
                        <button type="button" class="btn btn--danger btn--small" (click)="supprimer(u.id)">Supprimer</button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (message()) { <p class="alert alert--info" style="margin-top: 16px">{{ message() }}</p> }
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
  private readonly users = inject(UtilisateurService);
  private readonly auth = inject(AuthService);

  protected readonly message = signal<string | null>(null);
  protected readonly utilisateurs = this.users.utilisateurs;
  protected readonly moiId = computed(() => this.auth.courant()?.id ?? -1);
  protected readonly demandes = computed(() => this.users.utilisateurs().filter((u) => u.demandeTuteur === 'en_attente'));

  protected roleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : role === 'tuteur' ? 'Tuteur' : 'Étudiant';
  }

  protected decider(id: number, statut: 'validee' | 'refusee'): void {
    this.users.definirDemandeTuteur(id, statut);
    this.message.set(statut === 'validee' ? 'Demande validée : le rôle tuteur a été attribué.' : 'Demande refusée.');
  }

  protected basculerStatut(id: number): void {
    const u = this.users.trouverParId(id);
    if (!u) return;
    this.users.mettreAJour(id, { statut: u.statut === 'actif' ? 'suspendu' : 'actif' });
  }

  protected supprimer(id: number): void {
    const u = this.users.trouverParId(id);
    if (u && confirm(`Supprimer définitivement le compte de ${u.nom} ?`)) {
      this.users.supprimer(id);
      this.message.set('Compte supprimé.');
    }
  }
}
