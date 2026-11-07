import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Seance, StatutSeance } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { TuteurService } from '../../core/services/tuteur.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

const LIBELLES: Record<StatutSeance, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  terminee: 'Terminée',
  annulee: 'Annulée',
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
                    <span class="badge" [class.badge--attente]="s.statut === 'en_attente'" [class.badge--danger]="s.statut === 'annulee'" [class.badge--neutre]="s.statut === 'terminee'">
                      {{ libelle(s.statut) }}
                    </span>
                  </div>
                  <h2 class="seance__titre">{{ s.matiere }} avec {{ nomTuteur(s.tuteurId) }}</h2>
                  <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ dispoLabel(s) }} · {{ s.lieu }}</p>
                  @if (s.message) { <p class="muted message">« {{ s.message }} »</p> }
                  @if (s.avis) { <p class="avis">Ton avis : ★ {{ s.avis.note }}/5 — {{ s.avis.commentaire }}</p> }
                </div>

                <div class="seance__actions">
                  @if (s.statut === 'terminee' && !s.avis) {
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

                  @if (s.statut === 'en_attente' || s.statut === 'confirmee') {
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
    .avis { margin: 8px 0 0; font-size: 14px; color: var(--green-900); }
    .note-form { display: grid; gap: 10px; min-width: 240px; }
    @media (max-width: 640px) { .seance__actions { align-items: stretch; width: 100%; } }
  `,
})
export class MesSeancesComponent {
  private readonly auth = inject(AuthService);
  private readonly tuteurService = inject(TuteurService);
  private readonly users = inject(UtilisateurService);

  protected readonly onglet = signal<'venir' | 'historique'>('venir');
  protected readonly noteOuverte = signal<number | null>(null);
  protected note = 5;
  protected commentaire = '';

  protected readonly liste = computed(() => {
    const u = this.auth.courant();
    if (!u) return [];
    const mes = this.tuteurService.seances().filter((s) => s.etudiantId === u.id);
    const filtrees = mes.filter((s) =>
      this.onglet() === 'venir' ? s.statut === 'en_attente' || s.statut === 'confirmee' : s.statut === 'terminee' || s.statut === 'annulee',
    );
    return filtrees.sort((a, b) => b.dateSeance.localeCompare(a.dateSeance));
  });

  protected libelle(statut: StatutSeance): string {
    return LIBELLES[statut];
  }

  protected nomTuteur(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'tuteur';
  }

  protected dispoLabel(s: Seance): string {
    const d = this.tuteurService.disponibilites().find((x) => x.id === s.disponibiliteId);
    return d ? `${d.jour} ${d.debut}–${d.fin}` : '';
  }

  protected noter(seanceId: number): void {
    this.tuteurService.noter(seanceId, { note: Number(this.note), commentaire: this.commentaire.trim() });
    this.noteOuverte.set(null);
    this.commentaire = '';
  }

  protected annuler(seanceId: number): void {
    this.tuteurService.annuler(seanceId);
  }
}
