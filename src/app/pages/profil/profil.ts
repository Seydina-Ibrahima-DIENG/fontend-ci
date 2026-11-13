import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CandidatureTuteurResponse } from '../../core/api/api';
import { AuthService } from '../../core/services/auth.service';
import { CandidatureService } from '../../core/services/candidature.service';

@Component({
  selector: 'app-profil',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner grid-2-large">
        <div class="stack">
          <div>
            <p class="page__eyebrow">Compte</p>
            <h1 class="page__title">Mon <span class="accent">profil</span></h1>
          </div>

          <form class="card form" (ngSubmit)="enregistrer()">
            <h2 class="h2">Informations</h2>
            <label class="champ">
              <span class="champ__label">Prénom</span>
              <input name="prenom" required [(ngModel)]="prenom" />
            </label>
            <label class="champ">
              <span class="champ__label">Nom</span>
              <input name="nom" required [(ngModel)]="nomFamille" />
            </label>
            <label class="champ">
              <span class="champ__label">Téléphone</span>
              <input name="telephone" [(ngModel)]="telephone" />
            </label>
            @if (erreur()) { <p class="alert alert--erreur" role="alert">{{ erreur() }}</p> }
            @if (message()) { <p class="alert alert--succes" role="status">{{ message() }}</p> }
            <button type="submit" class="btn btn--primary">Enregistrer</button>
          </form>
        </div>

        <div class="stack">
          <div class="card card--muted">
            <h2 class="h2">Devenir tuteur</h2>
            <p class="muted">Statut de ta candidature : <strong>{{ statutLabel() }}</strong></p>
            <a class="btn btn--primary btn--small" routerLink="/devenir-tuteur" style="margin-top: 12px">Voir ma candidature</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid-2-large { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
    .form { display: grid; gap: 16px; }
    @media (max-width: 960px) { .grid-2-large { grid-template-columns: 1fr; } }
  `,
})
export class ProfilComponent {
  protected readonly auth = inject(AuthService);
  private readonly candidatures = inject(CandidatureService);

  protected prenom = this.auth.courant()?.prenom ?? '';
  protected nomFamille = this.auth.courant()?.nomFamille ?? '';
  protected telephone = this.auth.courant()?.telephone ?? '';

  protected readonly message = signal<string | null>(null);
  protected readonly erreur = signal<string | null>(null);
  protected readonly derniere = signal<CandidatureTuteurResponse | null>(null);

  constructor() {
    void this.candidatures.mesCandidatures().then((liste) => this.derniere.set(liste[0] ?? null));
  }

  protected statutLabel(): string {
    if (this.auth.role() === 'tuteur') return 'tuteur validé';
    const libelles: Record<string, string> = {
      EN_ATTENTE: 'en cours de validation',
      APPROUVEE: 'approuvée (reconnecte-toi)',
      REFUSEE: 'refusée',
    };
    const c = this.derniere();
    return c ? libelles[c.statut] : 'aucune candidature';
  }

  protected async enregistrer(): Promise<void> {
    this.message.set(null);
    this.erreur.set(null);
    const msg = await this.auth.mettreAJourProfil({
      prenom: this.prenom.trim(),
      nom: this.nomFamille.trim(),
      telephone: this.telephone.trim(),
    });
    if (msg) this.erreur.set(msg);
    else this.message.set('Profil mis à jour.');
  }
}
