import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ForumService } from '../../core/services/forum.service';
import { StructureService } from '../../core/services/structure.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-forum',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <div class="row row--between" style="margin-bottom: 8px">
          <div>
            <p class="page__eyebrow">Entraide</p>
            <h1 class="page__title">Questions <span class="accent">&amp; réponses</span></h1>
          </div>
          @if (auth.estConnecte()) {
            <button type="button" class="btn btn--primary" (click)="formOuvert.set(!formOuvert())">
              {{ formOuvert() ? 'Fermer' : 'Poser une question' }}
            </button>
          } @else {
            <a class="btn btn--primary" routerLink="/connexion">Connecte-toi pour poser une question</a>
          }
        </div>
        <p class="page__lead">Pose ta question dans une matière. Les étudiants, tuteurs et enseignants peuvent répondre.</p>

        @if (formOuvert()) {
          <form class="card form" (ngSubmit)="publier()">
            <label class="champ">
              <span class="champ__label">Matière</span>
              <select name="matiere" required [(ngModel)]="matiere">
                <option value="">Choisis une matière</option>
                @for (m of matieres(); track m) { <option [value]="m">{{ m }}</option> }
              </select>
            </label>
            <label class="champ">
              <span class="champ__label">Titre</span>
              <input name="titre" required [(ngModel)]="titre" placeholder="Résume ta question en une phrase" />
            </label>
            <label class="champ">
              <span class="champ__label">Détails</span>
              <textarea name="texte" [(ngModel)]="texte" placeholder="Qu'est-ce qui te bloque exactement ?"></textarea>
            </label>
            @if (erreur()) { <p class="alert alert--erreur">{{ erreur() }}</p> }
            <button type="submit" class="btn btn--primary">Publier</button>
          </form>
        }

        <div class="filtres">
          <input type="search" name="recherche" placeholder="Rechercher une question…" [ngModel]="recherche()" (ngModelChange)="recherche.set($event)" />
          <select name="matiereFiltre" [ngModel]="filtreMatiere()" (ngModelChange)="filtreMatiere.set($event)">
            <option value="">Toutes les matières</option>
            @for (m of matieres(); track m) { <option [value]="m">{{ m }}</option> }
          </select>
        </div>

        @if (questions().length === 0) {
          <div class="empty" style="margin-top: 20px"><p>Aucune question ne correspond. Sois le premier à en poser une !</p></div>
        } @else {
          <ul class="liste">
            @for (q of questions(); track q.id) {
              <li class="card question">
                <div class="row" style="margin-bottom: 8px">
                  <span class="badge">{{ q.matiere }}</span>
                  <span class="muted">{{ q.date }}</span>
                </div>
                <h2 class="question__titre"><a [routerLink]="['/forum', q.id]">{{ q.titre }}</a></h2>
                <p class="muted">
                  Posée par {{ nomAuteur(q.auteurId) }} · {{ q.reponses.length }} réponse{{ q.reponses.length > 1 ? 's' : '' }}
                  @if (q.meilleureReponseId) { · <span class="resolu">✓ résolue</span> }
                </p>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 16px; margin-bottom: 24px; }
    .filtres { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin: 24px 0 20px; }
    .filtres input, .filtres select { padding: 12px 14px; border: 1.5px solid #d9e3dd; border-radius: 12px; background: var(--white); font: inherit; font-size: 15px; }
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .question__titre { margin: 0 0 8px; font-family: var(--font-display); font-size: 19px; }
    .question__titre a:hover { color: var(--green-700); }
    .resolu { color: var(--green-700); font-weight: 600; }
    @media (max-width: 640px) { .filtres { grid-template-columns: 1fr; } }
  `,
})
export class ForumComponent {
  protected readonly auth = inject(AuthService);
  private readonly service = inject(ForumService);
  private readonly structure = inject(StructureService);
  private readonly users = inject(UtilisateurService);

  protected readonly formOuvert = signal(false);
  protected matiere = '';
  protected titre = '';
  protected texte = '';
  protected readonly erreur = signal<string | null>(null);

  protected readonly recherche = signal('');
  protected readonly filtreMatiere = signal('');

  protected readonly matieres = computed(() => this.structure.matieres().map((m) => m.nom).sort());

  protected readonly questions = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    return this.service.questions().filter((q) => {
      if (this.filtreMatiere() && q.matiere !== this.filtreMatiere()) return false;
      if (terme && !`${q.titre} ${q.texte}`.toLowerCase().includes(terme)) return false;
      return true;
    });
  });

  protected nomAuteur(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'Utilisateur';
  }

  protected publier(): void {
    const u = this.auth.courant();
    if (!u) return;
    if (!this.matiere || !this.titre.trim()) {
      this.erreur.set('Indique une matière et un titre.');
      return;
    }
    this.service.ajouterQuestion(u.id, this.matiere, this.titre.trim(), this.texte.trim());
    this.matiere = '';
    this.titre = '';
    this.texte = '';
    this.erreur.set(null);
    this.formOuvert.set(false);
  }
}
