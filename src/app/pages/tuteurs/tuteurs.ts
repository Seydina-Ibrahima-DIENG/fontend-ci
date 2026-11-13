import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuteurProfilResponse } from '../../core/api/api';
import { StructureService } from '../../core/services/structure.service';
import { TutoratService } from '../../core/services/tutorat.service';

@Component({
  selector: 'app-tuteurs',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <p class="page__eyebrow">Tutorat</p>
        <h1 class="page__title">Trouve un <span class="accent">tuteur</span></h1>
        <p class="page__lead">Des étudiants de niveau supérieur qui aident dans leurs matières. Filtre par matière.</p>

        <form class="filtres card" (submit)="$event.preventDefault()" role="search">
          <label class="champ">
            <span class="champ__label">Matière</span>
            <select name="matiere" [(ngModel)]="matiere" (ngModelChange)="matiereChoisie.set($event)">
              <option [ngValue]="null">Toutes les matières</option>
              @for (m of structure.matieres(); track m.id) { <option [ngValue]="m.id">{{ m.nom }}</option> }
            </select>
          </label>
        </form>

        <p class="muted" style="margin: 20px 0 16px"><strong>{{ tuteursFiltres().length }}</strong> tuteur{{ tuteursFiltres().length > 1 ? 's' : '' }}</p>

        @if (chargement()) {
          <p class="muted">Chargement…</p>
        } @else if (tuteursFiltres().length === 0) {
          <div class="empty"><p>Aucun tuteur ne correspond à ces critères.</p></div>
        } @else {
          <div class="grille">
            @for (t of tuteursFiltres(); track t.id) {
              <article class="card tuteur">
                <div class="tuteur__entete">
                  <span class="avatar">T{{ t.id }}</span>
                  <div>
                    <h2 class="tuteur__nom"><a [routerLink]="['/tuteur', t.id]">Tuteur n°{{ t.id }}</a></h2>
                    <p class="muted">{{ matieresDe(t) }}</p>
                  </div>
                </div>
                @if (t.description) { <p class="extrait">{{ t.description }}</p> }
                <div class="row row--between" style="margin-top: 14px">
                  <span></span>
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
    .extrait { margin: 12px 0 0; color: var(--text-600); line-height: 1.6; }
    .avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--green-900); color: var(--white); display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    @media (max-width: 640px) { .filtres { grid-template-columns: 1fr; } }
  `,
})
export class TuteursComponent {
  protected readonly structure = inject(StructureService);
  private readonly tutorat = inject(TutoratService);

  protected matiere: number | null = null;
  protected readonly matiereChoisie = signal<number | null>(null);
  protected readonly chargement = signal(true);

  private readonly tuteurs = signal<TuteurProfilResponse[]>([]);

  protected readonly tuteursFiltres = computed(() => {
    const id = this.matiereChoisie();
    return this.tuteurs().filter((t) => id === null || t.coursIds.includes(id));
  });

  constructor() {
    void this.tutorat.annuaire().then((liste) => {
      this.tuteurs.set(liste);
      this.chargement.set(false);
    });
  }

  protected matieresDe(t: TuteurProfilResponse): string {
    const noms = t.coursIds
      .map((id) => this.structure.matieres().find((m) => m.id === id)?.nom)
      .filter((n): n is string => !!n);
    return noms.join(', ') || 'Matières non renseignées';
  }
}
