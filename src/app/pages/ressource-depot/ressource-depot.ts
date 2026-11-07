import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LIBELLES_TYPE, TypeRessource } from '../../core/models/ressource.model';
import { RessourceService } from '../../core/services/ressource.service';
import { StructureService } from '../../core/services/structure.service';
import { AuthService } from '../../core/services/auth.service';

const EXTENSIONS = ['pdf', 'docx', 'pptx'] as const;
const TAILLE_MAX_KO = 10 * 1024; // 10 Mo

@Component({
  selector: 'app-ressource-depot',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Contribuer</p>
        <h1 class="page__title">Déposer une ressource</h1>
        <p class="page__lead">
          Ton document sera publié après validation par l'équipe (ou un enseignant).
          Formats acceptés : PDF, DOCX, PPTX, 10 Mo maximum.
        </p>

        @if (envoye()) {
          <div class="card">
            <p class="alert alert--succes" role="status">
              Merci ! Ta ressource est en attente de validation. Tu seras prévenu dès qu'elle est publiée.
            </p>
            <div class="row" style="margin-top: 16px">
              <a class="btn btn--primary btn--small" routerLink="/ressources">Retour à la bibliothèque</a>
              <button type="button" class="btn btn--ghost btn--small" (click)="reinitialiser()">Déposer une autre ressource</button>
            </div>
          </div>
        } @else {
          <form class="card form" (ngSubmit)="valider()">
            <label class="champ">
              <span class="champ__label">Titre</span>
              <input name="titre" required [(ngModel)]="titre" placeholder="Ex. TD 3 : arbres binaires — corrigé" />
            </label>

            <label class="champ">
              <span class="champ__label">Type</span>
              <select name="type" required [(ngModel)]="type">
                @for (t of types; track t) {
                  <option [value]="t">{{ libelles[t] }}</option>
                }
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Matière</span>
              <select name="matiere" required [(ngModel)]="matiere">
                <option value="">Choisis une matière</option>
                @for (m of structure.matieres(); track m.nom) {
                  <option [value]="m.nom">{{ m.nom }} ({{ m.niveau }})</option>
                }
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Année</span>
              <input type="number" name="annee" required [(ngModel)]="annee" min="2000" max="2100" />
            </label>

            <label class="champ">
              <span class="champ__label">Description</span>
              <textarea name="description" [(ngModel)]="description" placeholder="Précise le contenu, la session d'examen…"></textarea>
            </label>

            <label class="champ">
              <span class="champ__label">Fichier</span>
              <input type="file" name="fichier" accept=".pdf,.docx,.pptx" (change)="fichierChoisi($event)" />
              <span class="champ__aide">PDF, DOCX ou PPTX, 10 Mo maximum.</span>
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary" [disabled]="!formulaireValide()">Envoyer pour validation</button>
          </form>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 18px; }
  `,
})
export class RessourceDepotComponent {
  protected readonly structure = inject(StructureService);
  private readonly service = inject(RessourceService);
  private readonly auth = inject(AuthService);

  protected readonly libelles = LIBELLES_TYPE;
  protected readonly types = Object.keys(LIBELLES_TYPE) as TypeRessource[];

  protected titre = '';
  protected type: TypeRessource = 'cours';
  protected matiere = '';
  protected annee = new Date().getFullYear();
  protected description = '';
  protected fichier: File | null = null;

  protected readonly erreur = signal<string | null>(null);
  protected readonly envoye = signal(false);

  protected readonly formulaireValide = computed(() => !!this.titre.trim() && !!this.matiere && !!this.fichier);

  protected fichierChoisi(evenement: Event): void {
    const input = evenement.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.erreur.set(null);
    if (!f) {
      this.fichier = null;
      return;
    }
    const extension = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!(EXTENSIONS as readonly string[]).includes(extension)) {
      this.fichier = null;
      this.erreur.set('Format non accepté. Utilise un PDF, un DOCX ou un PPTX.');
      input.value = '';
      return;
    }
    if (f.size / 1024 > TAILLE_MAX_KO) {
      this.fichier = null;
      this.erreur.set('Le fichier dépasse 10 Mo.');
      input.value = '';
      return;
    }
    this.fichier = f;
  }

  protected valider(): void {
    const u = this.auth.courant();
    const matiere = this.structure.matieres().find((m) => m.nom === this.matiere);
    const filiere = this.structure.filieres().find((f) => f.nom === matiere?.filiere);
    if (!u || !matiere || !filiere || !this.fichier) return;

    const extension = this.fichier.name.split('.').pop()?.toUpperCase() as 'PDF' | 'DOCX' | 'PPTX';
    this.service.deposer({
      titre: this.titre.trim(),
      type: this.type,
      ufr: filiere.ufr,
      filiere: filiere.nom,
      niveau: matiere.niveau,
      matiere: matiere.nom,
      annee: Number(this.annee),
      format: extension,
      tailleKo: Math.round(this.fichier.size / 1024),
      deposePar: u.role === 'tuteur' ? 'Tuteur' : 'Étudiant',
      description: this.description.trim(),
    });
    this.envoye.set(true);
  }

  protected reinitialiser(): void {
    this.titre = '';
    this.matiere = '';
    this.description = '';
    this.fichier = null;
    this.envoye.set(false);
  }
}
