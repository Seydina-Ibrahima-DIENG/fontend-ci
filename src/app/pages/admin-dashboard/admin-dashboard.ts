import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumService } from '../../core/services/forum.service';
import { RessourceService } from '../../core/services/ressource.service';
import { TuteurService } from '../../core/services/tuteur.service';
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
          <div class="stat"><div class="stat__valeur">{{ nbUtilisateurs() }}</div><div class="stat__label">Utilisateurs</div></div>
          <div class="stat"><div class="stat__valeur">{{ nbRessources() }}</div><div class="stat__label">Ressources publiées</div></div>
          <div class="stat"><div class="stat__valeur">{{ nbSeances() }}</div><div class="stat__label">Séances</div></div>
          <div class="stat"><div class="stat__valeur">{{ nbQuestions() }}</div><div class="stat__label">Questions du forum</div></div>
          <div class="stat"><div class="stat__valeur">{{ nbEnAttente() }}</div><div class="stat__label">Ressources à valider</div></div>
          <div class="stat"><div class="stat__valeur">{{ nbDemandes() }}</div><div class="stat__label">Demandes de tuteur</div></div>
        </div>

        <div class="grid-2">
          <div class="card">
            <h2 class="h2">Ressources les plus téléchargées</h2>
            @for (r of topRessources(); track r.id) {
              <div class="barre-stat">
                <span class="tronque" [title]="r.titre">{{ r.titre }}</span>
                <div class="barre-stat__piste"><div class="barre-stat__remplissage" [style.width.%]="(r.telechargements / maxTelechargements()) * 100"></div></div>
                <strong>{{ r.telechargements }}</strong>
              </div>
            } @empty {
              <p class="muted">Aucune donnée.</p>
            }
          </div>

          <div class="card">
            <h2 class="h2">Matières les plus demandées</h2>
            @for (m of matieresDemandees(); track m.nom) {
              <div class="barre-stat">
                <span>{{ m.nom }}</span>
                <div class="barre-stat__piste"><div class="barre-stat__remplissage" [style.width.%]="(m.total / maxMatiere()) * 100"></div></div>
                <strong>{{ m.total }}</strong>
              </div>
            } @empty {
              <p class="muted">Aucune donnée.</p>
            }
          </div>

          <div class="card">
            <h2 class="h2">Tuteurs les plus actifs</h2>
            @for (t of tuteursActifs(); track t.nom) {
              <div class="barre-stat">
                <span>{{ t.nom }}</span>
                <div class="barre-stat__piste"><div class="barre-stat__remplissage" [style.width.%]="(t.total / maxTuteur()) * 100"></div></div>
                <strong>{{ t.total }}</strong>
              </div>
            } @empty {
              <p class="muted">Aucune donnée.</p>
            }
          </div>

          <div class="card">
            <h2 class="h2">Actions rapides</h2>
            <div class="liens">
              <a routerLink="/admin/utilisateurs">Gérer les utilisateurs et les demandes de tuteur →</a>
              <a routerLink="/admin/moderation">Valider les ressources et traiter les signalements →</a>
              <a routerLink="/admin/structure">Gérer la structure pédagogique →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .tronque { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .liens { display: grid; gap: 14px; }
    .liens a { font-weight: 600; color: var(--green-700); }
    .liens a:hover { text-decoration: underline; }
    @media (max-width: 960px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } }
  `,
})
export class AdminDashboardComponent {
  private readonly users = inject(UtilisateurService);
  private readonly ressources = inject(RessourceService);
  private readonly seances = inject(TuteurService);
  private readonly forum = inject(ForumService);

  protected readonly nbUtilisateurs = computed(() => this.users.utilisateurs().length);
  protected readonly nbRessources = computed(() => this.ressources.publiees().length);
  protected readonly nbSeances = computed(() => this.seances.seances().length);
  protected readonly nbQuestions = computed(() => this.forum.questions().length);
  protected readonly nbEnAttente = computed(() => this.ressources.enAttente().length);
  protected readonly nbDemandes = computed(() => this.users.utilisateurs().filter((u) => u.demandeTuteur === 'en_attente').length);

  protected readonly topRessources = computed(() =>
    [...this.ressources.publiees()].sort((a, b) => b.telechargements - a.telechargements).slice(0, 5),
  );
  protected readonly maxTelechargements = computed(() => Math.max(1, ...this.topRessources().map((r) => r.telechargements)));

  protected readonly matieresDemandees = computed(() => this.compter((s) => s.matiere).slice(0, 5));
  protected readonly maxMatiere = computed(() => Math.max(1, ...this.matieresDemandees().map((m) => m.total)));

  protected readonly tuteursActifs = computed(() =>
    this.compter((s) => this.users.trouverParId(s.tuteurId)?.nom ?? 'Tuteur inconnu').slice(0, 5).map((t) => ({ nom: t.nom, total: t.total })),
  );
  protected readonly maxTuteur = computed(() => Math.max(1, ...this.tuteursActifs().map((t) => t.total)));

  private compter(cle: (s: { matiere: string; tuteurId: number }) => string): { nom: string; total: number }[] {
    const compte = new Map<string, number>();
    for (const s of this.seances.seances()) {
      const k = cle(s);
      compte.set(k, (compte.get(k) ?? 0) + 1);
    }
    return [...compte.entries()].map(([nom, total]) => ({ nom, total })).sort((a, b) => b.total - a.total);
  }
}
