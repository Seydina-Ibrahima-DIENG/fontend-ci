import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mot-de-passe-oublie',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Mot de passe oublié</h1>
        <p class="page__lead">La réinitialisation par email n'est pas encore disponible.</p>

        @if (indisponible()) {
          <p class="alert alert--info" role="status">
            Pour récupérer ton accès, contacte l'administration de la plateforme.
          </p>
          <p class="pied"><a class="link-button" routerLink="/connexion">Retour à la connexion</a></p>
        } @else {
          <form class="card form" (ngSubmit)="envoyer()">
            <label class="champ">
              <span class="champ__label">Email</span>
              <input type="email" name="email" required [(ngModel)]="email" />
            </label>
            <button type="submit" class="btn btn--primary">Continuer</button>
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
  protected email = '';
  protected readonly indisponible = signal(false);

  protected envoyer(): void {
    // Pas encore de route backend pour la réinitialisation (F1.5).
    this.indisponible.set(true);
  }
}
