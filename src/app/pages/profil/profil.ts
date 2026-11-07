import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NIVEAUX } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { StructureService } from '../../core/services/structure.service';

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
              <span class="champ__label">Nom complet</span>
              <input name="nom" required [(ngModel)]="nom" />
            </label>
            <label class="champ">
              <span class="champ__label">Filière</span>
              <select name="filiere" [(ngModel)]="filiere">
                @for (f of structure.filieres(); track f.nom) { <option [value]="f.nom">{{ f.nom }}</option> }
              </select>
            </label>
            <label class="champ">
              <span class="champ__label">Niveau</span>
              <select name="niveau" [(ngModel)]="niveau">
                @for (n of niveaux; track n) { <option [value]="n">{{ n }}</option> }
              </select>
            </label>
            @if (message()) { <p class="alert alert--succes" role="status">{{ message() }}</p> }
            <button type="submit" class="btn btn--primary">Enregistrer</button>
          </form>
        </div>

        <div class="stack">
          <form class="card form" (ngSubmit)="changerMotDePasse()">
            <h2 class="h2">Mot de passe</h2>
            <label class="champ">
              <span class="champ__label">Mot de passe actuel</span>
              <input type="password" name="actuel" required [(ngModel)]="actuel" />
            </label>
            <label class="champ">
              <span class="champ__label">Nouveau mot de passe</span>
              <input type="password" name="nouveau" required minlength="8" [(ngModel)]="nouveau" />
            </label>
            @if (erreurMdp()) { <p class="alert alert--erreur" role="alert">{{ erreurMdp() }}</p> }
            @if (messageMdp()) { <p class="alert alert--succes" role="status">{{ messageMdp() }}</p> }
            <button type="submit" class="btn btn--ghost">Changer le mot de passe</button>
          </form>

          <div class="card card--muted">
            <h2 class="h2">Devenir tuteur</h2>
            <p class="muted">Statut de ta demande : <strong>{{ statutLabel() }}</strong></p>
            <a class="btn btn--primary btn--small" routerLink="/devenir-tuteur" style="margin-top: 12px">Faire une demande</a>
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
  protected readonly structure = inject(StructureService);

  protected readonly niveaux = NIVEAUX;

  private readonly u = this.auth.courant()!;
  protected nom = this.u.nom;
  protected filiere = this.u.filiere;
  protected niveau = this.u.niveau;

  protected actuel = '';
  protected nouveau = '';
  protected readonly message = signal<string | null>(null);
  protected readonly erreurMdp = signal<string | null>(null);
  protected readonly messageMdp = signal<string | null>(null);

  protected statutLabel(): string {
    const map = { aucune: 'aucune demande', en_attente: 'en cours de validation', validee: 'tuteur validé', refusee: 'refusée' };
    return map[this.auth.courant()?.demandeTuteur ?? 'aucune'];
  }

  protected enregistrer(): void {
    this.auth.mettreAJourProfil({ nom: this.nom.trim(), filiere: this.filiere, niveau: this.niveau });
    this.message.set('Profil mis à jour.');
  }

  protected changerMotDePasse(): void {
    this.messageMdp.set(null);
    if (this.actuel !== this.auth.courant()?.motDePasse) {
      this.erreurMdp.set('Le mot de passe actuel est incorrect.');
      return;
    }
    if (this.nouveau.length < 8) {
      this.erreurMdp.set('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    this.auth.mettreAJourProfil({ motDePasse: this.nouveau });
    this.erreurMdp.set(null);
    this.messageMdp.set('Mot de passe modifié.');
    this.actuel = '';
    this.nouveau = '';
  }
}
