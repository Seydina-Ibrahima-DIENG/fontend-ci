import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Mot de passe oublié</h1>
        <p class="page__lead">Indique ton email : si un compte existe, tu recevras un lien pour choisir un nouveau mot de passe.</p>

        @if (envoye()) {
          <p class="alert alert--succes" role="status">
            Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.
          </p>
          <p class="pied"><a class="link-button" routerLink="/connexion">Retour à la connexion</a></p>
        } @else {
          <form class="card form" (ngSubmit)="envoyer()">
            <label class="champ">
              <span class="champ__label">Email</span>
              <input type="email" name="email" required [(ngModel)]="email" />
            </label>
            <button type="submit" class="btn btn--primary">Envoyer le lien</button>
          </form>
        }
      </div>
    </section>
  `,
  styles: `
    .form { margin-bottom: 24px; }
    .pied { text-align: center; color: var(--text-600); }
  `,
})
export class MotDePasseOublieComponent {
  private readonly auth = inject(AuthService);

  protected email = '';
  protected readonly envoye = signal(false);

  protected envoyer(): void {
    // Simulation : le backend enverra réellement l'email (F1.5).
    this.auth.demanderReinitialisation(this.email);
    this.envoye.set(true);
  }
}
