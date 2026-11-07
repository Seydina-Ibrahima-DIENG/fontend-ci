import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/models';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Connexion</h1>
        <p class="page__lead">Accède à tes séances, tes favoris et tes questions.</p>

        <form class="card form" (ngSubmit)="valider()">
          <label class="champ">
            <span class="champ__label">Email</span>
            <input type="email" name="email" required [(ngModel)]="email" placeholder="ton.email@uadb.sn" />
          </label>

          <label class="champ">
            <span class="champ__label">Mot de passe</span>
            <input type="password" name="motDePasse" required [(ngModel)]="motDePasse" />
          </label>

          <div class="row row--between">
            <a class="link-button" routerLink="/mot-de-passe-oublie">Mot de passe oublié ?</a>
          </div>

          @if (erreur()) {
            <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
          }

          <button type="submit" class="btn btn--primary">Se connecter</button>
        </form>

        <div class="card card--muted demo">
          <p class="demo__titre">Comptes de démonstration</p>
          <p class="muted">Connexion rapide pour tester chaque espace (données mockées).</p>
          <div class="row">
            <button type="button" class="btn btn--ghost btn--small" (click)="demo('etudiant')">Étudiant</button>
            <button type="button" class="btn btn--ghost btn--small" (click)="demo('tuteur')">Tuteur</button>
            <button type="button" class="btn btn--ghost btn--small" (click)="demo('admin')">Admin</button>
          </div>
        </div>

        <p class="pied">Pas encore de compte ? <a class="link-button" routerLink="/inscription">Créer un compte</a></p>
      </div>
    </section>
  `,
  styles: `
    .form { margin-bottom: 24px; }
    .demo { display: grid; gap: 10px; }
    .demo__titre { margin: 0; font-weight: 700; color: var(--green-900); }
    .pied { text-align: center; color: var(--text-600); }
  `,
})
export class ConnexionComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected motDePasse = '';
  protected readonly erreur = signal<string | null>(null);

  protected valider(): void {
    const msg = this.auth.connecter(this.email, this.motDePasse);
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.allerVersEspace();
  }

  protected demo(role: Role): void {
    this.auth.connecterDemo(role);
    this.allerVersEspace();
  }

  private allerVersEspace(): void {
    this.router.navigateByUrl(this.auth.role() === 'admin' ? '/admin' : '/mes-seances');
  }
}
