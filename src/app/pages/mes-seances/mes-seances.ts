import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeanceResponse, StatutSeanceApi } from '../../core/api/api';
import { StructureService } from '../../core/services/structure.service';
import { TutoratService } from '../../core/services/tutorat.service';

const LIBELLES: Record<StatutSeanceApi, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  REFUSEE: 'Refusée',
  ANNULEE: 'Annulée',
  TERMINEE: 'Terminée',
};

@Component({
  selector: 'app-mes-seances',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <p class="page__eyebrow">Mon espace</p>
        <h1 class="page__title">Mes <span class="accent">séances</span></h1>
        <p class="page__lead">Suis tes demandes de tutorat, leur statut et ton historique.</p>

        @if (erreur()) { <p class="alert alert--erreur" role="alert">{{ erreur() }}</p> }

        <div class="tabs" role="tablist">
          <button type="button" role="tab" class="tab" [class.tab--actif]="onglet() === 'venir'" (click)="onglet.set('venir')">À venir</button>
          <button type="button" role="tab" class="tab" [class.tab--actif]="onglet() === 'historique'" (click)="onglet.set('historique')">Historique</button>
        </div>

        @if (liste().length === 0) {
          <div class="empty">
            <p><strong>Aucune séance ici pour le moment.</strong></p>
            <p>Trouve un tuteur pour réserver ta première séance.</p>
            <p style="margin-top: 16px"><a class="btn btn--primary btn--small" routerLink="/tuteur">Voir les tuteurs</a></p>
          </div>
        } @else {
          <ul class="liste">
            @for (s of liste(); track s.id) {
              <li class="card seance">
                <div class="seance__infos">
                  <div class="row" style="margin-bottom: 8px">
                    <span class="badge" [class.badge--attente]="s.statut === 'EN_ATTENTE'" [class.badge--danger]="s.statut === 'ANNULEE' || s.statut === 'REFUSEE'" [class.badge--neutre]="s.statut === 'TERMINEE'">
                      {{ libelle(s.statut) }}
                    </span>
                  </div>
                  <h2 class="seance__titre">{{ matiere(s.coursId) }} avec le tuteur n°{{ s.tuteurId }}</h2>
                  <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ s.heureDebut.slice(0, 5) }}–{{ s.heureFin.slice(0, 5) }} · {{ s.mode === 'DISTANCIEL' ? 'À distance' : (s.lieu ?? 'Présentiel') }}</p>
                  @if (s.motif) { <p class="muted message">« {{ s.motif }} »</p> }
                  @if (s.motifDecision) { <p class="muted">Réponse du tuteur : {{ s.motifDecision }}</p> }
                </div>

                <div class="seance__actions">
                  @if (s.statut === 'TERMINEE') {
                    @if (noteOuverte() !== s.id) {
                      <button type="button" class="btn btn--primary btn--small" (click)="noteOuverte.set(s.id)">Noter le tuteur</button>
                    } @else {
                      <form class="note-form" (ngSubmit)="noter(s.id)">
                        <label class="champ">
                          <span class="champ__label">Note</span>
                          <select name="note" [(ngModel)]="note">
                            @for (n of [5, 4, 3, 2, 1]; track n) { <option [ngValue]="n">{{ n }} / 5</option> }
                          </select>
                        </label>
                        <label class="champ">
                          <span class="champ__label">Commentaire</span>
                          <input name="commentaire" [(ngModel)]="commentaire" placeholder="Ce qui t'a aidé…" />
                        </label>
                        <button type="submit" class="btn btn--primary btn--small">Envoyer</button>
                      </form>
                    }
                  }

                  @if (s.statut === 'EN_ATTENTE' || s.statut === 'CONFIRMEE') {
                    <button type="button" class="btn btn--danger btn--small" (click)="annuler(s.id)">Annuler</button>
                  }
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .seance { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
    .seance__infos { min-width: 0; flex: 1 1 320px; }
    .seance__titre { margin: 0 0 6px; font-family: var(--font-display); font-size: 19px; }
    .seance__actions { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
    .message { font-style: italic; }
    .note-form { display: grid; gap: 10px; min-width: 240px; }
    @media (max-width: 640px) { .seance__actions { align-items: stretch; width: 100%; } }
  `,
})
export class MesSeancesComponent {
  private readonly tutorat = inject(TutoratService);
  private readonly structure = inject(StructureService);

  protected readonly onglet = signal<'venir' | 'historique'>('venir');
  protected readonly noteOuverte = signal<number | null>(null);
  protected readonly erreur = signal<string | null>(null);
  protected note = 5;
  protected commentaire = '';

  private readonly seances = signal<SeanceResponse[]>([]);

  protected readonly liste = computed(() =>
    this.seances()
      .filter((s) =>
        this.onglet() === 'venir'
          ? s.statut === 'EN_ATTENTE' || s.statut === 'CONFIRMEE'
          : s.statut === 'TERMINEE' || s.statut === 'ANNULEE' || s.statut === 'REFUSEE',
      )
      .sort((a, b) => b.dateSeance.localeCompare(a.dateSeance)),
  );

  constructor() {
    void this.charger();
  }

  protected libelle(statut: StatutSeanceApi): string {
    return LIBELLES[statut];
  }

  protected matiere(coursId: number): string {
    return this.structure.matieres().find((m) => m.id === coursId)?.nom ?? 'Matière';
  }

  protected async noter(seanceId: number): Promise<void> {
    this.erreur.set(null);
    const msg = await this.tutorat.deposerAvis(seanceId, Number(this.note), this.commentaire.trim());
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.noteOuverte.set(null);
    this.commentaire = '';
  }

  protected async annuler(seanceId: number): Promise<void> {
    this.erreur.set(null);
    const msg = await this.tutorat.annuler(seanceId);
    if (msg) this.erreur.set(msg);
    await this.charger();
  }

  private async charger(): Promise<void> {
    this.seances.set(await this.tutorat.seancesEtudiant());
  }
}
