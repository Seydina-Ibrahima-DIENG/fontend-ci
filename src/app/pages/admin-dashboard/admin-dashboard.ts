import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CandidatureTuteurResponse } from '../../core/api/api';
import { CandidatureService } from '../../core/services/candidature.service';
import { RessourceService } from '../../core/services/ressource.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';
import { AdminNavComponent } from '../admin-nav/admin-nav';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />

        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Tableau de <span class="accent">bord</span></h1>

        <div class="grid-3" style="margin: 28px 0 40px">
          <div class="stat"><div class="stat__valeur">{{ utilisateurs.utilisateurs().length }}</div><div class="stat__label">Utilisateurs</div></div>
          <div class="stat"><div class="stat__valeur">{{ ressources.publiees().length }}</div><div class="stat__label">Ressources publiées</div></div>
          <div class="stat"><div class="stat__valeur">{{ ressources.enAttente().length }}</div><div class="stat__label">Ressources à valider</div></div>
          <div class="stat"><div class="stat__valeur">{{ candidatures().length }}</div><div class="stat__label">Candidatures tuteur</div></div>
          <div class="stat"><div class="stat__valeur">{{ signalementsOuverts() }}</div><div class="stat__label">Signalements</div></div>
        </div>

        <div class="card">
          <h2 class="h2">Actions rapides</h2>
          <div class="liens">
            <a routerLink="/admin/utilisateurs">Gérer les comptes et les candidatures tuteur →</a>
            <a routerLink="/admin/moderation">Valider les ressources et traiter les signalements →</a>
            <a routerLink="/admin/structure">Gérer la structure pédagogique →</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .liens { display: grid; gap: 14px; }
    .liens a { font-weight: 600; color: var(--green-700); }
    .liens a:hover { text-decoration: underline; }
    @media (max-width: 960px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } }
  `,
})
export class AdminDashboardComponent {
  protected readonly utilisateurs = inject(UtilisateurService);
  protected readonly ressources = inject(RessourceService);
  private readonly candidatureService = inject(CandidatureService);

  protected readonly candidatures = signal<CandidatureTuteurResponse[]>([]);
  protected readonly signalementsOuverts = computed(
    () => this.ressources.signalements().filter((s) => s.statut === 'EN_ATTENTE').length,
  );

  constructor() {
    // Le compteur « Utilisateurs » lit la liste partagée : elle doit être chargée ici aussi.
    void this.utilisateurs.chargerComptes();
    void this.candidatureService.enAttente().then((liste) => this.candidatures.set(liste));
    void this.ressources.chargerEnAttente();
    void this.ressources.chargerSignalements();
  }
}
