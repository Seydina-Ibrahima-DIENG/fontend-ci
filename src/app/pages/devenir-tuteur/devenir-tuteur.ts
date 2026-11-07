import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StructureService } from '../../core/services/structure.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

/** Demande pour devenir tuteur (F1.6) — validée par l'admin (F1.7). */
@Component({
  selector: 'app-devenir-tuteur',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Tutorat</p>
        <h1 class="page__title">Devenir <span class="accent">tuteur</span></h1>
        <p class="page__lead">Indique les matières que tu maîtrises et joins un justificatif de ton niveau. L'administration valide ta demande.</p>

        @if (statut() === 'validee') {
          <p class="alert alert--succes">Tu es déjà tuteur. <a class="link-button" routerLink="/espace-tuteur">Ouvrir mon espace tuteur</a></p>
        } @else if (statut() === 'en_attente' && !modifiable()) {
          <p class="alert alert--info">Ta demande est en cours de validation par l'administration.</p>
        } @else if (statut() === 'refusee' && !modifiable()) {
          <p class="alert alert--erreur">Ta dernière demande a été refusée. Tu peux la corriger et la renvoyer.</p>
          <button type="button" class="btn btn--ghost btn--small" style="margin-top: 12px" (click)="modifiable.set(true)">Modifier ma demande</button>
        }

        @if (statut() === 'aucune' || modifiable() || statut() === 'refusee') {
          <form class="card form" (ngSubmit)="envoyer()">
            <fieldset class="champ">
              <legend class="champ__label">Matières maîtrisées</legend>
              <div class="cases">
                @for (m of structure.matieres(); track m.nom) {
                  <label class="champ--inline">
                    <input type="checkbox" [checked]="matieres.includes(m.nom)" (change)="basculer(m.nom)" />
                    {{ m.nom }} <span class="muted">({{ m.niveau }})</span>
                  </label>
                }
              </div>
            </fieldset>

            <label class="champ">
              <span class="champ__label">Présentation</span>
              <textarea name="description" [(ngModel)]="description" placeholder="Ton approche, ton expérience, tes disponibilités générales…"></textarea>
            </label>

            <label class="champ">
              <span class="champ__label">Justificatif</span>
              <input type="file" name="justificatif" accept=".pdf,.jpg,.jpeg,.png" (change)="fichier($event)" />
              <span class="champ__aide">Relevé de notes ou attestation, PDF ou image.</span>
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="matieres.length === 0">Envoyer ma demande</button>
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
  private readonly auth = inject(AuthService);
  private readonly users = inject(UtilisateurService);

  protected readonly statut = computed(() => this.auth.courant() && this.users.trouverParId(this.auth.courant()!.id)?.demandeTuteur || 'aucune');
  protected readonly modifiable = signal(false);

  protected matieres: string[] = [];
  protected description = '';
  protected justificatif: string | null = null;
  protected readonly erreur = signal<string | null>(null);

  protected basculer(nom: string): void {
    this.matieres = this.matieres.includes(nom) ? this.matieres.filter((m) => m !== nom) : [...this.matieres, nom];
  }

  protected fichier(evenement: Event): void {
    const input = evenement.target as HTMLInputElement;
    this.justificatif = input.files?.[0]?.name ?? null;
  }

  protected envoyer(): void {
    const u = this.auth.courant();
    if (!u) return;
    if (!this.justificatif) {
      this.erreur.set('Ajoute un justificatif pour finaliser ta demande.');
      return;
    }
    this.users.mettreAJour(u.id, {
      demandeTuteur: 'en_attente',
      matieres: this.matieres,
      description: this.description.trim(),
      justificatif: this.justificatif,
    });
    this.modifiable.set(false);
    this.erreur.set(null);
  }
}
