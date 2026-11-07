import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JOURS } from '../../core/models/models';
import { TuteurService } from '../../core/services/tuteur.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-tuteurs',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <p class="page__eyebrow">Tutorat</p>
        <h1 class="page__title">Trouve un <span class="accent">tuteur</span></h1>
        <p class="page__lead">Des étudiants de niveau supérieur qui aident dans leurs matières. Filtre par matière ou par jour de disponibilité.</p>

        <form class="filtres card" (submit)="$event.preventDefault()" role="search">
          <label class="champ">
            <span class="champ__label">Matière</span>
            <select name="matiere" [(ngModel)]="matiere">
              <option value="">Toutes les matières</option>
              @for (m of matieres(); track m) { <option [value]="m">{{ m }}</option> }
            </select>
          </label>
          <label class="champ">
            <span class="champ__label">Disponible le</span>
            <select name="jour" [(ngModel)]="jour">
              <option value="">Tous les jours</option>
              @for (j of jours; track j) { <option [value]="j">{{ j }}</option> }
            </select>
          </label>
        </form>

        <p class="muted" style="margin: 20px 0 16px"><strong>{{ tuteursFiltres().length }}</strong> tuteur{{ tuteursFiltres().length > 1 ? 's' : '' }}</p>

        @if (tuteursFiltres().length === 0) {
          <div class="empty"><p>Aucun tuteur ne correspond à ces critères.</p></div>
        } @else {
          <div class="grille">
            @for (t of tuteursFiltres(); track t.id) {
              <article class="card tuteur">
                <div class="tuteur__entete">
                  <span class="avatar">{{ initiales(t.nom) }}</span>
                  <div>
                    <h2 class="tuteur__nom"><a [routerLink]="['/tuteur', t.id]">{{ t.nom }}</a></h2>
                    <p class="muted">{{ t.niveau }} · {{ t.filiere }}</p>
                  </div>
                </div>
                <div class="row" style="margin: 14px 0">
                  @for (m of t.matieres; track m) { <span class="badge badge--neutre">{{ m }}</span> }
                </div>
                <div class="row row--between">
                  <span class="note">★ {{ users.noteMoyenne(t) || '—' }} <span class="muted">({{ t.notes.length }} avis)</span></span>
                  <a class="btn btn--ghost btn--small" [routerLink]="['/tuteur', t.id]">Voir le profil</a>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .filtres { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .tuteur__entete { display: flex; gap: 14px; align-items: center; }
    .tuteur__nom { margin: 0; font-family: var(--font-display); font-size: 19px; }
    .tuteur__nom a:hover { color: var(--green-700); }
    .avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--green-900); color: var(--white); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .note { font-weight: 700; color: var(--green-900); }
    @media (max-width: 640px) { .filtres { grid-template-columns: 1fr; } }
  `,
})
export class TuteursComponent {
  protected readonly users = inject(UtilisateurService);
  private readonly tuteurService = inject(TuteurService);

  protected readonly jours = JOURS;
  protected matiere = '';
  protected jour = '';

  protected readonly matieres = computed(() =>
    [...new Set(this.users.tuteurs().flatMap((t) => t.matieres))].sort(),
  );

  protected readonly tuteursFiltres = computed(() =>
    this.users.tuteurs().filter((t) => {
      if (this.matiere && !t.matieres.includes(this.matiere)) return false;
      if (this.jour && !this.tuteurService.disponibilitesDe(t.id).some((d) => d.jour === this.jour)) return false;
      return true;
    }),
  );

  protected initiales(nom: string): string {
    return nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
