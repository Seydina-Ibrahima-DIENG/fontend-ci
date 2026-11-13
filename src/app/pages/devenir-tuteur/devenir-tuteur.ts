import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CandidatureTuteurResponse } from '../../core/api/api';
import { CandidatureService } from '../../core/services/candidature.service';
import { StructureService } from '../../core/services/structure.service';

/** Candidature pour devenir tuteur (F1.6), validée par l'administration (F1.7). */
@Component({
  selector: 'app-devenir-tuteur',
  imports: [FormsModule],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Tutorat</p>
        <h1 class="page__title">Devenir <span class="accent">tuteur</span></h1>
        <p class="page__lead">Indique les matières que tu maîtrises et présente-toi. L'administration valide ta candidature.</p>

        @if (derniere(); as c) {
          @if (c.statut === 'APPROUVEE') {
            <p class="alert alert--succes">
              Ta candidature a été approuvée. Déconnecte-toi puis reconnecte-toi pour activer ton espace tuteur.
            </p>
          } @else if (c.statut === 'EN_ATTENTE') {
            <p class="alert alert--info">Ta candidature est en cours de validation par l'administration.</p>
          } @else if (c.statut === 'REFUSEE' && !modifiable()) {
            <p class="alert alert--erreur">
              Ta dernière candidature a été refusée{{ c.motifRefus ? " : « " + c.motifRefus + " »" : '' }}.
            </p>
            <button type="button" class="btn btn--ghost btn--small" style="margin-top: 12px" (click)="modifiable.set(true)">Renvoyer une candidature</button>
          }
        }

        @if (peutEnvoyer()) {
          <form class="card form" (ngSubmit)="envoyer()">
            <fieldset class="champ">
              <legend class="champ__label">Matières maîtrisées</legend>
              <div class="cases">
                @for (m of structure.matieres(); track m.id) {
                  <label class="champ--inline">
                    <input type="checkbox" [checked]="coursIds.includes(m.id)" (change)="basculer(m.id)" />
                    {{ m.nom }} <span class="muted">({{ m.niveau }})</span>
                  </label>
                }
              </div>
            </fieldset>

            <label class="champ">
              <span class="champ__label">Présentation</span>
              <textarea name="description" required [(ngModel)]="description" placeholder="Ton approche, ton expérience…"></textarea>
            </label>

            <label class="champ">
              <span class="champ__label">Motivation</span>
              <textarea name="motivation" required [(ngModel)]="motivation" placeholder="Pourquoi souhaites-tu accompagner d'autres étudiants ?"></textarea>
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="coursIds.length === 0 || enCours()">Envoyer ma candidature</button>
          </form>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 20px; }
    fieldset { border: 0; padding: 0; margin: 0; }
    .cases { display: grid; gap: 10px; margin-top: 8px; }
    .cases label { cursor: pointer; }
  `,
})
export class DevenirTuteurComponent {
  protected readonly structure = inject(StructureService);
  private readonly candidatures = inject(CandidatureService);

  protected readonly derniere = signal<CandidatureTuteurResponse | null>(null);
  protected readonly modifiable = signal(false);
  protected readonly enCours = signal(false);

  protected coursIds: number[] = [];
  protected description = '';
  protected motivation = '';
  protected readonly erreur = signal<string | null>(null);

  constructor() {
    void this.charger();
  }

  /** Le formulaire s'affiche sans candidature en cours, ou pour renvoyer une candidature refusée. */
  protected peutEnvoyer(): boolean {
    const c = this.derniere();
    return !c || (c.statut === 'REFUSEE' && this.modifiable());
  }

  protected basculer(id: number): void {
    this.coursIds = this.coursIds.includes(id) ? this.coursIds.filter((x) => x !== id) : [...this.coursIds, id];
  }

  protected async envoyer(): Promise<void> {
    this.erreur.set(null);
    this.enCours.set(true);
    const msg = await this.candidatures.deposer({
      description: this.description.trim(),
      motivation: this.motivation.trim(),
      coursIds: this.coursIds,
    });
    this.enCours.set(false);
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.modifiable.set(false);
    await this.charger();
  }

  private async charger(): Promise<void> {
    const liste = await this.candidatures.mesCandidatures();
    this.derniere.set(liste[0] ?? null);
  }
}
