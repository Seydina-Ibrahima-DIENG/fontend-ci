import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminNavComponent } from '../admin-nav/admin-nav';
import { ForumService } from '../../core/services/forum.service';
import { RessourceService } from '../../core/services/ressource.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { LIBELLES_TYPE } from '../../core/models/ressource.model';

@Component({
  selector: 'app-admin-moderation',
  imports: [RouterLink, AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />
        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Modération</h1>

        <h2 class="h2" style="margin-top: 32px">Ressources à valider ({{ enAttente().length }})</h2>
        @if (enAttente().length === 0) {
          <div class="empty"><p>Rien à valider pour le moment.</p></div>
        } @else {
          <ul class="liste">
            @for (r of enAttente(); track r.id) {
              <li class="card ligne">
                <div class="ligne__infos">
                  <span class="badge">{{ libelle(r.type) }}</span>
                  <h3 class="titre">{{ r.titre }}</h3>
                  <p class="muted">{{ r.matiere }} · {{ r.niveau }} · {{ r.annee }} · {{ r.format }} · déposé par {{ r.deposePar }}</p>
                  @if (r.description) { <p class="muted">{{ r.description }}</p> }
                </div>
                <div class="row">
                  <button type="button" class="btn btn--primary btn--small" (click)="ressources.valider(r.id)">Valider</button>
                  <button type="button" class="btn btn--danger btn--small" (click)="ressources.rejeter(r.id)">Rejeter</button>
                </div>
              </li>
            }
          </ul>
        }

        <h2 class="h2" style="margin-top: 40px">Signalements</h2>
        @if (signalementsOuverts().length === 0) {
          <div class="empty"><p>Aucun signalement ouvert.</p></div>
        } @else {
          <ul class="liste">
            @for (s of signalementsOuverts(); track s.id) {
              <li class="card ligne">
                <div class="ligne__infos">
                  <p><strong>Ressource n° {{ s.ressourceId }}</strong> : {{ titreRessource(s.ressourceId) }}</p>
                  <p class="muted">Motif : {{ s.motif }}</p>
                  <a class="link-button" [routerLink]="['/ressources', s.ressourceId]">Ouvrir la ressource →</a>
                </div>
                <button type="button" class="btn btn--ghost btn--small" (click)="ressources.traiterSignalement(s.id)">Marquer traité</button>
              </li>
            }
          </ul>
        }

        <h2 class="h2" style="margin-top: 40px">Forum : contenus à surveiller</h2>
        @if (questions().length === 0) {
          <div class="empty"><p>Aucune question.</p></div>
        } @else {
          <ul class="liste">
            @for (q of questions(); track q.id) {
              <li class="card ligne">
                <div class="ligne__infos">
                  <span class="badge badge--neutre">{{ q.matiere }}</span>
                  <p><strong>{{ q.titre }}</strong></p>
                  <p class="muted">{{ nomAuteur(q.auteurId) }} · {{ q.reponses.length }} réponse(s)</p>
                  <a class="link-button" [routerLink]="['/forum', q.id]">Voir la discussion →</a>
                </div>
                <button type="button" class="btn btn--danger btn--small" (click)="forum.supprimerQuestion(q.id)">Supprimer</button>
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
  protected readonly forum = inject(ForumService);
  private readonly users = inject(UtilisateurService);

  protected readonly enAttente = this.ressources.enAttente;
  protected readonly questions = this.forum.questions;
  protected readonly signalementsOuverts = computed(() =>
    this.ressources.signalements().filter((s) => s.statut === 'ouvert'),
  );

  protected libelle(type: keyof typeof LIBELLES_TYPE): string {
    return LIBELLES_TYPE[type];
  }

  protected titreRessource(id: number): string {
    return this.ressources.trouver(id)?.titre ?? '(ressource supprimée)';
  }

  protected nomAuteur(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'Utilisateur';
  }
}
