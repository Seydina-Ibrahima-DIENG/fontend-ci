import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ForumService } from '../../core/services/forum.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-forum-question',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <a class="link-button" routerLink="/forum">← Retour au forum</a>

        @if (question(); as q) {
          <div class="stack" style="margin-top: 24px">
            <div class="card">
              <div class="row" style="margin-bottom: 10px">
                <span class="badge">{{ q.matiere }}</span>
                <span class="muted">{{ q.date | date:'dd/MM/yyyy' }}</span>
              </div>
              <h1 class="titre">{{ q.titre }}</h1>
              <p class="muted">Posée par {{ nomAuteur(q.auteurId) }}</p>
              @if (q.texte) { <p class="texte">{{ q.texte }}</p> }

              @if (estAdmin()) {
                <button type="button" class="btn btn--danger btn--small" (click)="supprimerQuestion(q.id)">Supprimer la question</button>
              }
            </div>

            <div>
              <h2 class="h2">{{ q.reponses.length }} réponse{{ q.reponses.length > 1 ? 's' : '' }}</h2>

              @if (q.reponses.length === 0) {
                <div class="empty"><p>Pas encore de réponse. Lance-toi !</p></div>
              }

              <ul class="reponses">
                @for (r of q.reponses; track r.id) {
                  <li class="card reponse" [class.reponse--meilleure]="q.meilleureReponseId === r.id">
                    @if (q.meilleureReponseId === r.id) {
                      <span class="badge badge--meilleure">✓ Meilleure réponse</span>
                    }
                    <p class="texte">{{ r.texte }}</p>
                    <div class="row row--between">
                      <span class="muted">{{ nomAuteur(r.auteurId) }} · {{ r.date | date:'dd/MM/yyyy' }}</span>
                      <div class="row">
                        @if (estAuteurQuestion(q.auteurId) && !q.meilleureReponseId) {
                          <button type="button" class="link-button" (click)="choisir(q.id, r.id)">Choisir comme meilleure</button>
                        }
                        @if (estAdmin()) {
                          <button type="button" class="link-button link-button--danger" (click)="supprimerReponse(q.id, r.id)">Supprimer</button>
                        }
                      </div>
                    </div>
                  </li>
                }
              </ul>
            </div>

            @if (auth.estConnecte()) {
              <form class="card form" (ngSubmit)="repondre(q.id)">
                <h2 class="h2">Ta réponse</h2>
                <textarea name="reponse" required [(ngModel)]="reponse" placeholder="Explique ta démarche, pas seulement le résultat."></textarea>
                <button type="submit" class="btn btn--primary" [disabled]="!reponse.trim()">Publier la réponse</button>
              </form>
            } @else {
              <p class="muted"><a class="link-button" routerLink="/connexion">Connecte-toi</a> pour répondre.</p>
            }
          </div>
        } @else {
          <div class="empty" style="margin-top: 24px"><p>Cette question n'existe pas ou a été supprimée.</p></div>
        }
      </div>
    </section>
  `,
  styles: `
    .titre { margin: 0 0 8px; font-family: var(--font-display); font-size: clamp(24px, 3vw, 32px); color: var(--green-900); }
    .texte { line-height: 1.7; color: var(--text-900); white-space: pre-line; }
    .reponses { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .reponse--meilleure { border-color: var(--green-700); box-shadow: 0 0 0 1px var(--green-700) inset; }
    .badge--meilleure { background: var(--green-700); color: var(--white); margin-bottom: 10px; }
    .link-button--danger { color: var(--danger); }
    .form { display: grid; gap: 14px; }
    .form textarea { min-height: 120px; padding: 12px 14px; border: 1.5px solid #d9e3dd; border-radius: 12px; font: inherit; }
  `,
})
export class ForumQuestionComponent {
  protected readonly auth = inject(AuthService);
  private readonly service = inject(ForumService);
  private readonly users = inject(UtilisateurService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly question = computed(() => this.service.trouver(this.id));
  protected reponse = '';

  protected estAdmin(): boolean {
    return this.auth.role() === 'admin';
  }

  protected estAuteurQuestion(auteurId: number): boolean {
    return this.auth.courant()?.id === auteurId;
  }

  protected nomAuteur(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'Utilisateur';
  }

  protected repondre(questionId: number): void {
    const u = this.auth.courant();
    if (!u || !this.reponse.trim()) return;
    this.service.repondre(questionId, u.id, this.reponse.trim());
    this.reponse = '';
  }

  protected choisir(questionId: number, reponseId: number): void {
    this.service.choisirMeilleure(questionId, reponseId);
  }

  protected supprimerQuestion(id: number): void {
    this.service.supprimerQuestion(id);
  }

  protected supprimerReponse(questionId: number, reponseId: number): void {
    this.service.supprimerReponse(questionId, reponseId);
  }
}
