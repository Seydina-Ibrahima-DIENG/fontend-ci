import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JOURS, Seance } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { TuteurService } from '../../core/services/tuteur.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-espace-tuteur',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <p class="page__eyebrow">Espace tuteur</p>
        <h1 class="page__title">Bonjour <span class="accent">{{ prenom() }}</span></h1>
        <p class="page__lead">Gère tes disponibilités et réponds aux demandes des étudiants.</p>

        <div class="grid-3" style="margin-bottom: 32px">
          <div class="stat"><div class="stat__valeur">{{ demandes().length }}</div><div class="stat__label">Demandes en attente</div></div>
          <div class="stat"><div class="stat__valeur">{{ confirmees().length }}</div><div class="stat__label">Séances confirmées</div></div>
          <div class="stat"><div class="stat__valeur">{{ moyenne() || '—' }}</div><div class="stat__label">Note moyenne</div></div>
        </div>

        <div class="tabs" role="tablist">
          <button type="button" class="tab" [class.tab--actif]="onglet() === 'demandes'" (click)="onglet.set('demandes')">Demandes ({{ demandes().length }})</button>
          <button type="button" class="tab" [class.tab--actif]="onglet() === 'seances'" (click)="onglet.set('seances')">Séances</button>
          <button type="button" class="tab" [class.tab--actif]="onglet() === 'dispos'" (click)="onglet.set('dispos')">Disponibilités</button>
        </div>

        @if (onglet() === 'demandes') {
          @if (demandes().length === 0) {
            <div class="empty"><p>Aucune demande en attente.</p></div>
          } @else {
            <ul class="liste">
              @for (s of demandes(); track s.id) {
                <li class="card ligne">
                  <div class="ligne__infos">
                    <h2 class="titre">{{ s.matiere }} · {{ nomEtudiant(s.etudiantId) }}</h2>
                    <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ dispoLabel(s.disponibiliteId) }} · {{ s.lieu }}</p>
                    @if (s.message) { <p class="muted message">« {{ s.message }} »</p> }
                  </div>
                  <div class="row">
                    <button type="button" class="btn btn--primary btn--small" (click)="repondre(s.id, 'accepter')">Accepter</button>
                    <button type="button" class="btn btn--danger btn--small" (click)="repondre(s.id, 'refuser')">Refuser</button>
                    @if (reportId() !== s.id) {
                      <button type="button" class="btn btn--ghost btn--small" (click)="reportId.set(s.id)">Reporter</button>
                    } @else {
                      <select [(ngModel)]="nouvelleDispo" name="report-{{ s.id }}" aria-label="Nouveau créneau">
                        <option [ngValue]="null">Choisir un créneau</option>
                        @for (d of mesDispos(); track d.id) { <option [ngValue]="d.id">{{ d.jour }} {{ d.debut }}</option> }
                      </select>
                      <button type="button" class="btn btn--ghost btn--small" [disabled]="!nouvelleDispo" (click)="reporter(s.id)">Confirmer</button>
                    }
                  </div>
                </li>
              }
            </ul>
          }
        }

        @if (onglet() === 'seances') {
          @if (confirmees().length === 0) {
            <div class="empty"><p>Aucune séance confirmée.</p></div>
          } @else {
            <ul class="liste">
              @for (s of confirmees(); track s.id) {
                <li class="card ligne">
                  <div class="ligne__infos">
                    <h2 class="titre">{{ s.matiere }} · {{ nomEtudiant(s.etudiantId) }}</h2>
                    <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ dispoLabel(s.disponibiliteId) }} · {{ s.lieu }}</p>
                  </div>
                  <button type="button" class="btn btn--primary btn--small" (click)="terminer(s.id)">Marquer terminée</button>
                </li>
              }
            </ul>
          }
        }

        @if (onglet() === 'dispos') {
          <div class="grid-2">
            <div class="card">
              <h2 class="h2">Mes créneaux</h2>
              @if (mesDispos().length === 0) {
                <p class="muted">Aucun créneau. Ajoute tes disponibilités pour recevoir des demandes.</p>
              } @else {
                <ul class="dispos">
                  @for (d of mesDispos(); track d.id) {
                    <li>
                      <span>{{ d.jour }} · {{ d.debut }} – {{ d.fin }}</span>
                      <button type="button" class="link-button" (click)="supprimerDispo(d.id)">Supprimer</button>
                    </li>
                  }
                </ul>
              }
            </div>

            <form class="card form" (ngSubmit)="ajouterDispo()">
              <h2 class="h2">Ajouter un créneau</h2>
              <label class="champ">
                <span class="champ__label">Jour</span>
                <select name="jour" [(ngModel)]="jour">
                  @for (j of jours; track j) { <option [value]="j">{{ j }}</option> }
                </select>
              </label>
              <div class="grid-2">
                <label class="champ">
                  <span class="champ__label">Début</span>
                  <input type="time" name="debut" [(ngModel)]="debut" />
                </label>
                <label class="champ">
                  <span class="champ__label">Fin</span>
                  <input type="time" name="fin" [(ngModel)]="fin" />
                </label>
              </div>
              @if (erreur()) { <p class="alert alert--erreur">{{ erreur() }}</p> }
              <button type="submit" class="btn btn--primary">Ajouter</button>
            </form>
          </div>
        }

        <p style="margin-top: 32px"><a class="link-button" routerLink="/ressources/depot">Déposer une ressource →</a></p>
      </div>
    </section>
  `,
  styles: `
    .liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .ligne { display: flex; justify-content: space-between; gap: 16px; align-items: center; flex-wrap: wrap; }
    .ligne__infos { min-width: 0; flex: 1 1 300px; }
    .titre { margin: 0 0 6px; font-family: var(--font-display); font-size: 18px; }
    .message { font-style: italic; }
    .dispos { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .dispos li { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
    .form { display: grid; gap: 16px; align-content: start; }
    @media (max-width: 960px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } }
  `,
})
export class EspaceTuteurComponent {
  private readonly auth = inject(AuthService);
  private readonly tuteurService = inject(TuteurService);
  private readonly users = inject(UtilisateurService);

  protected readonly jours = JOURS;
  protected readonly onglet = signal<'demandes' | 'seances' | 'dispos'>('demandes');
  protected readonly reportId = signal<number | null>(null);
  protected nouvelleDispo: number | null = null;

  protected jour = JOURS[0];
  protected debut = '17:00';
  protected fin = '18:00';
  protected readonly erreur = signal<string | null>(null);

  protected readonly prenom = computed(() => this.auth.courant()?.nom.split(' ')[0] ?? '');

  protected readonly mesDispos = computed(() => {
    const id = this.auth.courant()?.id ?? -1;
    return this.tuteurService.disponibilitesDe(id);
  });

  protected readonly demandes = computed(() => this.mesSeances().filter((s) => s.statut === 'en_attente'));
  protected readonly confirmees = computed(() => this.mesSeances().filter((s) => s.statut === 'confirmee'));

  protected readonly moyenne = computed(() => {
    const u = this.auth.courant();
    return u ? this.users.noteMoyenne(this.users.trouverParId(u.id)!) : 0;
  });

  private mesSeances(): Seance[] {
    const id = this.auth.courant()?.id ?? -1;
    return this.tuteurService.seances().filter((s) => s.tuteurId === id);
  }

  protected nomEtudiant(id: number): string {
    return this.users.trouverParId(id)?.nom ?? 'Étudiant';
  }

  protected dispoLabel(id: number): string {
    const d = this.tuteurService.disponibilites().find((x) => x.id === id);
    return d ? `${d.jour} ${d.debut}–${d.fin}` : '';
  }

  protected repondre(id: number, action: 'accepter' | 'refuser'): void {
    this.tuteurService.repondre(id, action);
  }

  protected reporter(id: number): void {
    this.tuteurService.repondre(id, 'reporter', this.nouvelleDispo ?? undefined);
    this.reportId.set(null);
    this.nouvelleDispo = null;
  }

  protected terminer(id: number): void {
    this.tuteurService.terminer(id);
  }

  protected ajouterDispo(): void {
    const u = this.auth.courant();
    if (!u) return;
    if (!this.debut || !this.fin || this.debut >= this.fin) {
      this.erreur.set("L'heure de fin doit être après l'heure de début.");
      return;
    }
    this.erreur.set(null);
    this.tuteurService.ajouterDisponibilite(u.id, this.jour, this.debut, this.fin);
  }

  protected supprimerDispo(id: number): void {
    this.tuteurService.supprimerDisponibilite(id);
  }
}
