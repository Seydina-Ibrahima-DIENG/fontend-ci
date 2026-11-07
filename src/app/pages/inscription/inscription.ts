import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NIVEAUX } from '../../core/models/models';
import { StructureService } from '../../core/services/structure.service';

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Créer un compte</h1>
        <p class="page__lead">Pour les étudiants de l'UADB. Ton filière et ton niveau permettent de te montrer les bonnes ressources.</p>

        <form class="card form" (ngSubmit)="valider()">
          <label class="champ">
            <span class="champ__label">Nom complet</span>
            <input name="nom" required [(ngModel)]="nom" />
          </label>

          <label class="champ">
            <span class="champ__label">Email</span>
            <input type="email" name="email" required [(ngModel)]="email" />
          </label>

          <label class="champ">
            <span class="champ__label">Mot de passe</span>
            <input type="password" name="motDePasse" required minlength="8" [(ngModel)]="motDePasse" />
            <span class="champ__aide">8 caractères minimum.</span>
          </label>

          <label class="champ">
            <span class="champ__label">UFR</span>
            <select name="ufr" required [(ngModel)]="ufr">
              @for (u of structure.ufrs(); track u.nom) {
                <option [value]="u.nom">{{ u.nom }}</option>
              }
            </select>
          </label>

          <label class="champ">
            <span class="champ__label">Filière</span>
            <select name="filiere" required [(ngModel)]="filiere">
              @for (f of filieresDeLUfr(); track f.nom) {
                <option [value]="f.nom">{{ f.nom }}</option>
              }
            </select>
          </label>

          <label class="champ">
            <span class="champ__label">Niveau</span>
            <select name="niveau" required [(ngModel)]="niveau">
              @for (n of niveaux; track n) {
                <option [value]="n">{{ n }}</option>
              }
            </select>
          </label>

          @if (erreur()) {
            <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
          }

          <button type="submit" class="btn btn--primary">Créer mon compte</button>
        </form>

        <p class="pied">Déjà inscrit ? <a class="link-button" routerLink="/connexion">Se connecter</a></p>
      </div>
    </section>
  `,
  styles: `
    .form { margin-bottom: 24px; }
    .pied { text-align: center; color: var(--text-600); }
  `,
})
export class InscriptionComponent {
  protected readonly structure = inject(StructureService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly niveaux = NIVEAUX;

  protected nom = '';
  protected email = '';
  protected motDePasse = '';
  protected ufr = this.structure.ufrs()[0]?.nom ?? '';
  protected filiere = '';
  protected niveau = NIVEAUX[0];
  protected readonly erreur = signal<string | null>(null);

  protected filieresDeLUfr() {
    return this.structure.filieres().filter((f) => f.ufr === this.ufr);
  }

  protected valider(): void {
    if (!this.filiere) this.filiere = this.filieresDeLUfr()[0]?.nom ?? '';
    const msg = this.auth.inscrire({
      nom: this.nom,
      email: this.email,
      motDePasse: this.motDePasse,
      ufr: this.ufr,
      filiere: this.filiere,
      niveau: this.niveau,
    });
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.router.navigateByUrl('/mes-seances');
  }
}
