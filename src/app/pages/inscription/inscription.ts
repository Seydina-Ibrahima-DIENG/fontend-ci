import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InscriptionInstitutionnelleResponse } from '../../core/api/api';
import { AuthService } from '../../core/services/auth.service';

/**
 * Inscription institutionnelle : l'étudiant (ou l'enseignant) s'identifie avec son matricule
 * et son email institutionnels. Un mot de passe temporaire est alors généré.
 */
@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Activer mon compte</h1>
        <p class="page__lead">
          Les comptes sont réservés aux membres de l'UADB. Renseigne ton matricule et ton email institutionnel.
        </p>

        @if (compte(); as c) {
          <div class="card">
            <p class="alert alert--succes" role="status">{{ c.message }}</p>
            <p style="margin-top: 16px">Bonjour {{ c.prenom }} {{ c.nom }}. Ton mot de passe temporaire :</p>
            <p class="mot-de-passe"><code>{{ c.motDePasseTemporaire }}</code></p>
            <p class="muted">Note-le maintenant : il ne sera plus affiché. Tu le remplaceras à ta première connexion.</p>
            <p style="margin-top: 16px"><a class="btn btn--primary btn--small" routerLink="/connexion">Aller à la connexion</a></p>
          </div>
        } @else {
          <form class="card form" (ngSubmit)="valider()">
            <label class="champ">
              <span class="champ__label">Matricule</span>
              <input name="matricule" required [(ngModel)]="matricule" />
            </label>

            <label class="champ">
              <span class="champ__label">Email institutionnel</span>
              <input type="email" name="email" required [(ngModel)]="email" />
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="enCours()">Activer mon compte</button>
          </form>
        }

        <p class="pied">Déjà activé ? <a class="link-button" routerLink="/connexion">Se connecter</a></p>
      </div>
    </section>
  `,
  styles: `
    .form { margin-bottom: 24px; }
    .mot-de-passe { font-size: 20px; margin: 12px 0; }
    .pied { text-align: center; color: var(--text-600); }
  `,
})
export class InscriptionComponent {
  private readonly auth = inject(AuthService);

  protected matricule = '';
  protected email = '';
  protected readonly erreur = signal<string | null>(null);
  protected readonly enCours = signal(false);
  protected readonly compte = signal<InscriptionInstitutionnelleResponse | null>(null);

  protected async valider(): Promise<void> {
    this.erreur.set(null);
    this.enCours.set(true);
    const { erreur, reponse } = await this.auth.inscriptionInstitutionnelle(this.matricule.trim(), this.email.trim());
    this.enCours.set(false);
    if (erreur) this.erreur.set(erreur);
    else this.compte.set(reponse ?? null);
  }
}
