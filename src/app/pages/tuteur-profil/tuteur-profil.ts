import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TuteurService } from '../../core/services/tuteur.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-tuteur-profil',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <a class="link-button" routerLink="/tuteur">← Tous les tuteurs</a>

        @if (tuteur(); as t) {
          <div class="layout" style="margin-top: 24px">
            <div class="stack">
              <div class="card">
                <div class="entete">
                  <span class="avatar">{{ initiales(t.nom) }}</span>
                  <div>
                    <h1 class="page__title" style="font-size: clamp(26px, 3.4vw, 36px); margin-bottom: 4px">{{ t.nom }}</h1>
                    <p class="muted">{{ t.niveau }} · {{ t.filiere }} · {{ t.ufr }}</p>
                    <p class="note">★ {{ users.noteMoyenne(t) || '—' }} <span class="muted">({{ t.notes.length }} avis)</span></p>
                  </div>
                </div>

                @if (t.description) {
                  <p class="description">{{ t.description }}</p>
                }

                <h2 class="h2">Matières</h2>
                <div class="row">
                  @for (m of t.matieres; track m) { <span class="badge">{{ m }}</span> }
                </div>
              </div>

              <div class="card">
                <h2 class="h2">Avis des étudiants</h2>
                @if (avis().length === 0) {
                  <p class="muted">Aucun avis pour l'instant.</p>
                } @else {
                  <ul class="avis">
                    @for (a of avis(); track a.id) {
                      <li>
                        <p class="avis__entete"><strong>{{ a.matiere }}</strong> · ★ {{ a.note }}/5</p>
                        <p class="muted">{{ a.commentaire }}</p>
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>

            <aside class="stack">
              <div class="card">
                <h2 class="h2">Disponibilités</h2>
                @if (dispos().length === 0) {
                  <p class="muted">Aucune disponibilité publiée.</p>
                } @else {
                  <ul class="dispos">
                    @for (d of dispos(); track d.id) {
                      <li>{{ d.jour }} · {{ d.debut }} – {{ d.fin }}</li>
                    }
                  </ul>
                }

                @if (auth.estConnecte()) {
                  <a class="btn btn--primary" style="width: 100%; margin-top: 16px" [routerLink]="['/tuteur', t.id, 'reserver']">Réserver une séance</a>
                } @else {
                  <a class="btn btn--primary" style="width: 100%; margin-top: 16px" routerLink="/connexion">Connecte-toi pour réserver</a>
                }
              </div>
            </aside>
          </div>
        } @else {
          <div class="empty" style="margin-top: 24px"><p>Ce tuteur n'existe pas ou n'est plus disponible.</p></div>
        }
      </div>
    </section>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .entete { display: flex; gap: 18px; align-items: center; margin-bottom: 20px; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--green-900); color: var(--white); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 24px; font-weight: 700; flex-shrink: 0; }
    .note { margin: 6px 0 0; font-weight: 700; color: var(--green-900); }
    .description { line-height: 1.7; color: var(--text-600); }
    .avis { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
    .avis__entete { margin: 0 0 4px; }
    .dispos { margin: 0; padding-left: 18px; line-height: 1.9; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class TuteurProfilComponent {
  protected readonly users = inject(UtilisateurService);
  protected readonly auth = inject(AuthService);
  private readonly tuteurService = inject(TuteurService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly tuteur = computed(() => {
    const u = this.users.trouverParId(this.id);
    return u && u.role === 'tuteur' && u.statut === 'actif' ? u : undefined;
  });

  protected readonly dispos = computed(() => this.tuteurService.disponibilitesDe(this.id));

  protected readonly avis = computed(() =>
    this.tuteurService
      .seances()
      .filter((s) => s.tuteurId === this.id && s.avis)
      .map((s) => ({ id: s.id, matiere: s.matiere, note: s.avis!.note, commentaire: s.avis!.commentaire })),
  );

  protected initiales(nom: string): string {
    return nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
