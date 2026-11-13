import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** Choix du mot de passe définitif après une inscription institutionnelle. */
@Component({
  selector: 'app-premiere-connexion',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Choisis ton mot de passe</h1>

        @if (auth.premiereConnexion(); as pc) {
          <p class="page__lead">Bienvenue{{ pc.prenom ? ' ' + pc.prenom : '' }}. Pour sécuriser ton compte, remplace le mot de passe temporaire reçu à l'inscription.</p>

          <form class="card form" (ngSubmit)="valider()">
            <label class="champ">
              <span class="champ__label">Nouveau mot de passe</span>
              <input type="password" name="nouveau" required minlength="8" [(ngModel)]="nouveau" />
              <span class="champ__aide">8 caractères minimum.</span>
            </label>

            <label class="champ">
              <span class="champ__label">Confirme le mot de passe</span>
              <input type="password" name="confirmation" required [(ngModel)]="confirmation" />
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="enCours()">Enregistrer et continuer</button>
          </form>
        } @else {
          <div class="empty" style="margin-top: 24px">
            <p>Aucune première connexion en cours.</p>
            <p style="margin-top: 12px"><a class="link-button" routerLink="/connexion">Retour à la connexion</a></p>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 18px; }
  `,
})
export class PremiereConnexionComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected nouveau = '';
  protected confirmation = '';
  protected readonly erreur = signal<string | null>(null);
  protected readonly enCours = signal(false);

  protected async valider(): Promise<void> {
    if (this.nouveau !== this.confirmation) {
      this.erreur.set('Les deux mots de passe ne correspondent pas.');
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    const msg = await this.auth.changerMotDePasseInitial(this.nouveau);
    this.enCours.set(false);
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.router.navigateByUrl(this.auth.role() === 'admin' ? '/admin' : '/mes-seances');
  }
}
