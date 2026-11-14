import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InscriptionRequest } from '../../core/api/api';
import { AuthService } from '../../core/services/auth.service';
import { StructureService } from '../../core/services/structure.service';

/** Domaine exigé par le backend : la plateforme est réservée aux membres de l'UADB. */
const DOMAINE_UADB = '@uadb.edu.sn';

/**
 * Inscription libre : l'étudiant ou l'enseignant crée son compte avec son email institutionnel
 * (@uadb.edu.sn). Le compte est actif immédiatement et la session est ouverte.
 */
@Component({
  selector: 'app-inscription',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Compte</p>
        <h1 class="page__title">Créer mon compte</h1>
        <p class="page__lead">
          La plateforme est réservée aux membres de l'UADB : utilise ton email institutionnel ({{ domaine }}).
        </p>

        <form class="card form" (ngSubmit)="valider()">
          <label class="champ">
            <span class="champ__label">Je suis</span>
            <select name="role" [(ngModel)]="role">
              <option value="ETUDIANT">Étudiant</option>
              <option value="ENSEIGNANT">Enseignant</option>
            </select>
          </label>

          <label class="champ">
            <span class="champ__label">Prénom</span>
            <input name="prenom" required maxlength="100" [(ngModel)]="prenom" />
          </label>

          <label class="champ">
            <span class="champ__label">Nom</span>
            <input name="nom" required maxlength="100" [(ngModel)]="nom" />
          </label>

          <label class="champ">
            <span class="champ__label">Email institutionnel</span>
            <input type="email" name="email" required [placeholder]="'prenom.nom' + domaine" [(ngModel)]="email" />
          </label>

          <label class="champ">
            <span class="champ__label">Mot de passe (8 caractères minimum)</span>
            <input type="password" name="motDePasse" required minlength="8" [(ngModel)]="motDePasse" />
          </label>

          <label class="champ">
            <span class="champ__label">Téléphone (facultatif)</span>
            <input type="tel" name="telephone" maxlength="20" [(ngModel)]="telephone" />
          </label>

          @if (role === 'ETUDIANT') {
            <label class="champ">
              <span class="champ__label">Code permanent</span>
              <input name="codePermanent" required maxlength="50" [(ngModel)]="codePermanent" />
            </label>

            @if (structure.filieres().length) {
              <label class="champ">
                <span class="champ__label">Filière (facultatif)</span>
                <select name="filiereId" [(ngModel)]="filiereId">
                  <option [ngValue]="null">—</option>
                  @for (f of structure.filieres(); track f.id) {
                    <option [ngValue]="f.id">{{ f.nom }}</option>
                  }
                </select>
              </label>
            }

            @if (structure.niveaux().length) {
              <label class="champ">
                <span class="champ__label">Niveau (facultatif)</span>
                <select name="niveauId" [(ngModel)]="niveauId">
                  <option [ngValue]="null">—</option>
                  @for (n of structure.niveaux(); track n.id) {
                    <option [ngValue]="n.id">{{ n.nom }}</option>
                  }
                </select>
              </label>
            }
          } @else {
            <label class="champ">
              <span class="champ__label">Matricule professionnel (facultatif)</span>
              <input name="matriculeProfessionnel" maxlength="50" [(ngModel)]="matriculeProfessionnel" />
            </label>
          }

          @if (erreur()) {
            <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
          }

          <button type="submit" class="btn btn--primary" [disabled]="enCours()">Créer mon compte</button>
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
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly structure = inject(StructureService);

  protected readonly domaine = DOMAINE_UADB;

  protected role: 'ETUDIANT' | 'ENSEIGNANT' = 'ETUDIANT';
  protected prenom = '';
  protected nom = '';
  protected email = '';
  protected motDePasse = '';
  protected telephone = '';
  protected codePermanent = '';
  protected filiereId: number | null = null;
  protected niveauId: number | null = null;
  protected matriculeProfessionnel = '';

  protected readonly erreur = signal<string | null>(null);
  protected readonly enCours = signal(false);

  protected async valider(): Promise<void> {
    this.erreur.set(null);

    // Contrôles rapides côté navigateur ; le backend reste la référence.
    const email = this.email.trim().toLowerCase();
    if (!email.endsWith(DOMAINE_UADB)) {
      this.erreur.set(`L'adresse email doit se terminer par ${DOMAINE_UADB}.`);
      return;
    }
    if (this.motDePasse.length < 8) {
      this.erreur.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    const demande: InscriptionRequest = {
      nom: this.nom.trim(),
      prenom: this.prenom.trim(),
      email,
      motDePasse: this.motDePasse,
      telephone: this.telephone.trim() || undefined,
      role: this.role,
    };
    if (this.role === 'ETUDIANT') {
      demande.codePermanent = this.codePermanent.trim();
      demande.filiereId = this.filiereId ?? undefined;
      demande.niveauId = this.niveauId ?? undefined;
    } else {
      demande.matriculeProfessionnel = this.matriculeProfessionnel.trim() || undefined;
    }

    this.enCours.set(true);
    const msg = await this.auth.inscrire(demande);
    this.enCours.set(false);
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    this.router.navigateByUrl('/mes-seances');
  }
}
