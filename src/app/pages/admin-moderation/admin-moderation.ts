import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LIBELLES_TYPE, Ressource, TypeRessource } from '../../core/models/ressource.model';
import { AuthService } from '../../core/services/auth.service';
import { RessourceService } from '../../core/services/ressource.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AdminNavComponent } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-moderation',
  imports: [FormsModule, RouterLink, AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />
        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Modération</h1>

        @if (erreur()) { <p class="alert alert--erreur" role="alert">{{ erreur() }}</p> }

        <h2 class="h2" style="margin-top: 32px">Ressources à valider ({{ ressources.enAttente().length }})</h2>
        @if (ressources.enAttente().length === 0) {
          <div class="empty"><p>Rien à valider pour le moment.</p></div>
        } @else {
          <ul class="liste">
            @for (r of ressources.enAttente(); track r.id) {
              <li class="card ligne">
                <div class="ligne__infos">
                  <span class="badge">{{ libelle(r.type) }}</span>
                  <h3 class="titre">{{ r.titre }}</h3>
                  <p class="muted">{{ r.matiere }} · {{ r.niveau }} · {{ r.annee }} · déposée par l'utilisateur n°{{ r.auteurId }}</p>
                  @if (r.description) { <p class="muted">{{ r.description }}</p> }
                </div>
                <div class="row">
                  <button type="button" class="btn btn--primary btn--small" (click)="valider(r)">Valider</button>
                  @if (rejetId() !== r.id) {
                    <button type="button" class="btn btn--danger btn--small" (click)="rejetId.set(r.id)">Rejeter</button>
                  } @else {
                    <input name="motif-{{ r.id }}" placeholder="Motif du rejet" [(ngModel)]="motif" />
                    <button type="button" class="btn btn--danger btn--small" [disabled]="!motif.trim()" (click)="rejeter(r)">Confirmer</button>
                  }
                </div>
              </li>
            }
          </ul>
        }

        <h2 class="h2" style="margin-top: 40px">Signalements ({{ signalementsOuverts().length }})</h2>
        @if (signalementsOuverts().length === 0) {
          <div class="empty"><p>Aucun signalement en attente.</p></div>
        } @else {
          <ul class="liste">
            @for (s of signalementsOuverts(); track s.id) {
              <li class="card ligne">
                <div class="ligne__infos">
                  <p><strong>{{ s.titreRessource }}</strong></p>
                  <p class="muted">Motif : {{ s.motif }}{{ s.description ? ' — ' + s.description : '' }}</p>
                  <a class="link-button" [routerLink]="['/ressources', s.ressourceId]">Ouvrir la ressource →</a>
                </div>
                <div class="row">
                  <button type="button" class="btn btn--ghost btn--small" (click)="traiter(s.id, 'TRAITE')">Marquer traité</button>
                  <button type="button" class="btn btn--ghost btn--small" (click)="traiter(s.id, 'REJETE')">Classer sans suite</button>
                </div>
              </li>
            }
          </ul>
        }

      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .ligne { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
    .ligne__infos { min-width: 0; flex: 1 1 320px; }
    .ligne__infos p { margin: 4px 0; }
    .titre { margin: 8px 0 4px; font-family: var(--font-display); font-size: 18px; }
  `,
})
export class AdminModerationComponent {
  protected readonly ressources = inject(RessourceService);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UtilisateurService);

  protected readonly erreur = signal<string | null>(null);
  protected readonly rejetId = signal<number | null>(null);
  protected motif = '';

  protected readonly signalementsOuverts = computed(() =>
    this.ressources.signalements().filter((s) => s.statut === 'EN_ATTENTE'),
  );

  constructor() {
    void this.ressources.chargerEnAttente();
    void this.ressources.chargerSignalements();
  }

  protected libelle(type: string): string {
    return LIBELLES_TYPE[type as TypeRessource] ?? type;
  }

  protected async valider(r: Ressource): Promise<void> {
    await this.executer(() => this.ressources.valider(r.id, this.moiId()));
  }

  protected async rejeter(r: Ressource): Promise<void> {
    const motif = this.motif.trim();
    this.rejetId.set(null);
    this.motif = '';
    await this.executer(() => this.ressources.rejeter(r.id, this.moiId(), motif));
  }

  protected async traiter(id: number, statut: 'TRAITE' | 'REJETE'): Promise<void> {
    await this.executer(() => this.ressources.traiterSignalement(id, statut));
  }

  protected nomAuteur(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'Utilisateur';
  }

  private moiId(): number {
    return this.auth.courant()?.id ?? -1;
  }

  private async executer(action: () => Promise<string | null>): Promise<void> {
    this.erreur.set(null);
    const msg = await action();
    if (msg) this.erreur.set(msg);
  }
}
