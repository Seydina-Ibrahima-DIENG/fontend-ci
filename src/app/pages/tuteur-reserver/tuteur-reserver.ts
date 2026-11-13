import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TuteurProfilResponse } from '../../core/api/api';
import { StructureService } from '../../core/services/structure.service';
import { TutoratService } from '../../core/services/tutorat.service';

@Component({
  selector: 'app-tuteur-reserver',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <a class="link-button" [routerLink]="['/tuteur', id]">← Retour au profil</a>

        @if (tuteur(); as t) {
          <p class="page__eyebrow" style="margin-top: 20px">Réservation</p>
          <h1 class="page__title">Réserver avec le tuteur n°{{ t.id }}</h1>
          <p class="page__lead">Choisis une matière, une date et un créneau. Le tuteur accepte ou refuse ta demande.</p>

          <form class="card form" (ngSubmit)="valider()">
            <label class="champ">
              <span class="champ__label">Matière</span>
              <select name="matiere" required [(ngModel)]="coursId">
                <option [ngValue]="null" disabled>Choisis une matière</option>
                @for (m of matieres(t); track m.id) { <option [ngValue]="m.id">{{ m.nom }}</option> }
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Date de la séance</span>
              <input type="date" name="date" required [(ngModel)]="date" />
            </label>

            <div class="grid-2">
              <label class="champ">
                <span class="champ__label">Début</span>
                <input type="time" name="debut" required [(ngModel)]="heureDebut" />
              </label>
              <label class="champ">
                <span class="champ__label">Fin</span>
                <input type="time" name="fin" required [(ngModel)]="heureFin" />
              </label>
            </div>

            <label class="champ">
              <span class="champ__label">Mode</span>
              <select name="mode" required [(ngModel)]="mode">
                <option value="PRESENTIEL">En présentiel</option>
                <option value="DISTANCIEL">À distance</option>
              </select>
            </label>

            @if (mode === 'PRESENTIEL') {
              <label class="champ">
                <span class="champ__label">Lieu</span>
                <input name="lieu" [(ngModel)]="lieu" placeholder="Ex. Bibliothèque universitaire, salle 2" />
              </label>
            }

            <label class="champ">
              <span class="champ__label">Message pour le tuteur</span>
              <textarea name="motif" [(ngModel)]="motif" placeholder="Ex. Je bloque sur les listes chaînées du TD 2."></textarea>
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="enCours()">Envoyer la demande</button>
          </form>
        } @else {
          <div class="empty" style="margin-top: 24px"><p>Ce tuteur n'est pas disponible.</p></div>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 18px; }
  `,
})
export class TuteurReserverComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly structure = inject(StructureService);
  private readonly tutorat = inject(TutoratService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly tuteur = signal<TuteurProfilResponse | undefined>(undefined);

  protected coursId: number | null = null;
  protected date = '';
  protected heureDebut = '17:00';
  protected heureFin = '18:00';
  protected mode: 'PRESENTIEL' | 'DISTANCIEL' = 'PRESENTIEL';
  protected lieu = '';
  protected motif = '';
  protected readonly erreur = signal<string | null>(null);
  protected readonly enCours = signal(false);

  constructor() {
    void this.tutorat.consulter(this.id).then((t) => this.tuteur.set(t));
  }

  /** Matières que ce tuteur enseigne, parmi le catalogue. */
  protected matieres(t: TuteurProfilResponse) {
    return this.structure.matieres().filter((m) => t.coursIds.includes(m.id));
  }

  protected async valider(): Promise<void> {
    if (this.coursId === null || !this.date) {
      this.erreur.set('Choisis une matière et une date.');
      return;
    }
    if (this.heureDebut >= this.heureFin) {
      this.erreur.set("L'heure de fin doit être après l'heure de début.");
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    const msg = await this.tutorat.demander({
      tuteurId: this.id,
      coursId: this.coursId,
      dateSeance: this.date,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      mode: this.mode,
      lieu: this.mode === 'PRESENTIEL' ? this.lieu.trim() : '',
      motif: this.motif.trim(),
    });
    this.enCours.set(false);
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.router.navigateByUrl('/mes-seances');
  }
}
