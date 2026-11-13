import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisResumeResponse, DisponibiliteResponse, SeanceResponse, TuteurProfilResponse } from '../../core/api/api';
import { JOURS } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { StructureService } from '../../core/services/structure.service';
import { JOURS_API, TutoratService } from '../../core/services/tutorat.service';

@Component({
  selector: 'app-espace-tuteur',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="page">
      <div class="page__inner">
        <p class="page__eyebrow">Espace tuteur</p>
        <h1 class="page__title">Bonjour <span class="accent">{{ prenom() }}</span></h1>
        <p class="page__lead">Gère tes disponibilités et réponds aux demandes des étudiants.</p>

        @if (erreur()) { <p class="alert alert--erreur" role="alert">{{ erreur() }}</p> }

        <div class="grid-3" style="margin-bottom: 32px">
          <div class="stat"><div class="stat__valeur">{{ demandes().length }}</div><div class="stat__label">Demandes en attente</div></div>
          <div class="stat"><div class="stat__valeur">{{ confirmees().length }}</div><div class="stat__label">Séances confirmées</div></div>
          <div class="stat"><div class="stat__valeur">{{ moyenne() }}</div><div class="stat__label">Note moyenne</div></div>
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
                    <h2 class="titre">{{ matiere(s.coursId) }} · étudiant n°{{ s.etudiantId }}</h2>
                    <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ s.heureDebut.slice(0, 5) }}–{{ s.heureFin.slice(0, 5) }} · {{ s.mode === 'DISTANCIEL' ? 'À distance' : (s.lieu ?? 'Présentiel') }}</p>
                    @if (s.motif) { <p class="muted message">« {{ s.motif }} »</p> }
                  </div>
                  <div class="row">
                    <button type="button" class="btn btn--primary btn--small" (click)="accepter(s.id)">Accepter</button>
                    @if (refusId() !== s.id) {
                      <button type="button" class="btn btn--danger btn--small" (click)="refusId.set(s.id)">Refuser</button>
                    } @else {
                      <input name="motif-{{ s.id }}" placeholder="Motif (facultatif)" [(ngModel)]="motifRefus" />
                      <button type="button" class="btn btn--danger btn--small" (click)="refuser(s.id)">Confirmer</button>
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
                    <h2 class="titre">{{ matiere(s.coursId) }} · étudiant n°{{ s.etudiantId }}</h2>
                    <p class="muted">{{ s.dateSeance | date:'dd/MM/yyyy' }} · {{ s.heureDebut.slice(0, 5) }}–{{ s.heureFin.slice(0, 5) }} · {{ s.mode === 'DISTANCIEL' ? 'À distance' : (s.lieu ?? 'Présentiel') }}</p>
                  </div>
                  <div class="row">
                    <button type="button" class="btn btn--primary btn--small" (click)="terminer(s.id)">Marquer terminée</button>
                    <button type="button" class="btn btn--ghost btn--small" (click)="annuler(s.id)">Annuler</button>
                  </div>
                </li>
              }
            </ul>
          }
        }

        @if (onglet() === 'dispos') {
          <div class="grid-2">
            <div class="card">
              <h2 class="h2">Mes créneaux</h2>
              @if (dispos().length === 0) {
                <p class="muted">Aucun créneau. Ajoute tes disponibilités pour recevoir des demandes.</p>
              } @else {
                <ul class="dispos">
                  @for (d of dispos(); track d.id) {
                    <li>
                      <span>{{ libelleJour(d.jour) }} · {{ d.heureDebut.slice(0, 5) }} – {{ d.heureFin.slice(0, 5) }}</span>
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
              @if (erreurDispo()) { <p class="alert alert--erreur">{{ erreurDispo() }}</p> }
              <button type="submit" class="btn btn--primary">Ajouter</button>
            </form>
          </div>
        }
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
  private readonly tutorat = inject(TutoratService);
  private readonly structure = inject(StructureService);

  protected readonly jours = JOURS;
  protected readonly onglet = signal<'demandes' | 'seances' | 'dispos'>('demandes');
  protected readonly erreur = signal<string | null>(null);
  protected readonly erreurDispo = signal<string | null>(null);

  protected readonly refusId = signal<number | null>(null);
  protected motifRefus = '';

  protected jour = JOURS[0];
  protected debut = '17:00';
  protected fin = '18:00';

  protected readonly prenom = computed(() => this.auth.courant()?.prenom ?? '');

  private readonly seances = signal<SeanceResponse[]>([]);
  protected readonly dispos = signal<DisponibiliteResponse[]>([]);
  private readonly profil = signal<TuteurProfilResponse | null>(null);
  private readonly resume = signal<AvisResumeResponse | null>(null);

  protected readonly demandes = computed(() => this.seances().filter((s) => s.statut === 'EN_ATTENTE'));
  protected readonly confirmees = computed(() => this.seances().filter((s) => s.statut === 'CONFIRMEE'));
  protected readonly moyenne = computed(() => {
    const n = this.resume()?.noteMoyenne;
    return n ? Math.round(n * 10) / 10 : '—';
  });

  constructor() {
    void this.charger();
  }

  protected matiere(coursId: number): string {
    return this.structure.matieres().find((m) => m.id === coursId)?.nom ?? 'Matière';
  }

  protected libelleJour(jourApi: string): string {
    const entree = Object.entries(JOURS_API).find(([, v]) => v === jourApi);
    return entree ? entree[0] : jourApi;
  }

  protected async accepter(id: number): Promise<void> {
    await this.executer(() => this.tutorat.accepter(id));
  }

  protected async refuser(id: number): Promise<void> {
    const motif = this.motifRefus.trim();
    this.refusId.set(null);
    this.motifRefus = '';
    await this.executer(() => this.tutorat.refuser(id, motif));
  }

  protected async terminer(id: number): Promise<void> {
    await this.executer(() => this.tutorat.terminer(id));
  }

  protected async annuler(id: number): Promise<void> {
    await this.executer(() => this.tutorat.annuler(id));
  }

  protected async ajouterDispo(): Promise<void> {
    if (!this.debut || !this.fin || this.debut >= this.fin) {
      this.erreurDispo.set("L'heure de fin doit être après l'heure de début.");
      return;
    }
    this.erreurDispo.set(null);
    const msg = await this.tutorat.ajouterDisponibilite(this.jour, this.debut, this.fin);
    if (msg) this.erreurDispo.set(msg);
    else this.dispos.set(await this.tutorat.disponibilites());
  }

  protected async supprimerDispo(id: number): Promise<void> {
    const msg = await this.tutorat.supprimerDisponibilite(id);
    if (msg) this.erreur.set(msg);
    this.dispos.set(await this.tutorat.disponibilites());
  }

  private async executer(action: () => Promise<string | null>): Promise<void> {
    this.erreur.set(null);
    const msg = await action();
    if (msg) this.erreur.set(msg);
    await this.charger();
  }

  private async charger(): Promise<void> {
    const [seances, dispos, profil] = await Promise.all([
      this.tutorat.seancesTuteur(),
      this.tutorat.disponibilites(),
      this.tutorat.monProfil(),
    ]);
    this.seances.set(seances);
    this.dispos.set(dispos);
    this.profil.set(profil);
    this.resume.set(profil ? (await this.tutorat.resumeAvis(profil.id)) ?? null : null);
  }
}
