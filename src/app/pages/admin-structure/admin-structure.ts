import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../admin-nav/admin-nav';
import { StructureService } from '../../core/services/structure.service';

/** Structure pédagogique : UFR > filière > niveau > matière (F2.1). */
@Component({
  selector: 'app-admin-structure',
  imports: [FormsModule, AdminNavComponent],
  template: `
    <section class="page">
      <div class="page__inner">
        <app-admin-nav />
        <p class="page__eyebrow">Administration</p>
        <h1 class="page__title">Structure <span class="accent">pédagogique</span></h1>
        <p class="page__lead">Ces listes alimentent les filtres, l'arborescence des ressources et le formulaire d'inscription.</p>

        @if (message()) { <p class="alert alert--info" style="margin-bottom: 24px">{{ message() }}</p> }

        <div class="grid-2">
          <!-- UFR -->
          <div class="card">
            <h2 class="h2">UFR</h2>
            <ul class="items">
              @for (u of structure.ufrs(); track u.nom) {
                <li><span>{{ u.nom }}</span><button type="button" class="link-button link-button--danger" (click)="supprimerUfr(u.nom)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout" (ngSubmit)="ajouterUfr()">
              <input name="nouvelleUfr" placeholder="Nouvelle UFR" [(ngModel)]="nouvelleUfr" />
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouvelleUfr.trim()">Ajouter</button>
            </form>
          </div>

          <!-- Filières -->
          <div class="card">
            <h2 class="h2">Filières</h2>
            <ul class="items">
              @for (f of structure.filieres(); track f.nom) {
                <li><span>{{ f.nom }} <span class="muted">· {{ f.ufr }}</span></span><button type="button" class="link-button link-button--danger" (click)="supprimerFiliere(f.nom)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout ajout--multi" (ngSubmit)="ajouterFiliere()">
              <input name="nouvelleFiliere" placeholder="Nouvelle filière" [(ngModel)]="nouvelleFiliere" />
              <select name="ufrFiliere" [(ngModel)]="ufrFiliere">
                @for (u of structure.ufrs(); track u.nom) { <option [value]="u.nom">{{ u.nom }}</option> }
              </select>
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouvelleFiliere.trim()">Ajouter</button>
            </form>
          </div>

          <!-- Niveaux -->
          <div class="card">
            <h2 class="h2">Niveaux</h2>
            <ul class="items">
              @for (n of structure.niveaux(); track n.nom) {
                <li><span>{{ n.nom }}</span><button type="button" class="link-button link-button--danger" (click)="supprimerNiveau(n.nom)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout" (ngSubmit)="ajouterNiveau()">
              <input name="nouveauNiveau" placeholder="Nouveau niveau" [(ngModel)]="nouveauNiveau" />
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouveauNiveau.trim()">Ajouter</button>
            </form>
          </div>

          <!-- Matières -->
          <div class="card">
            <h2 class="h2">Matières</h2>
            <ul class="items">
              @for (m of structure.matieres(); track m.nom) {
                <li><span>{{ m.nom }} <span class="muted">· {{ m.filiere }} · {{ m.niveau }}</span></span><button type="button" class="link-button link-button--danger" (click)="supprimerMatiere(m.nom)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout ajout--multi" (ngSubmit)="ajouterMatiere()">
              <input name="nouvelleMatiere" placeholder="Nouvelle matière" [(ngModel)]="nouvelleMatiere" />
              <select name="filiereMatiere" [(ngModel)]="filiereMatiere">
                @for (f of structure.filieres(); track f.nom) { <option [value]="f.nom">{{ f.nom }}</option> }
              </select>
              <select name="niveauMatiere" [(ngModel)]="niveauMatiere">
                @for (n of structure.niveaux(); track n.nom) { <option [value]="n.nom">{{ n.nom }}</option> }
              </select>
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouvelleMatiere.trim()">Ajouter</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .items { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 4px; }
    .items li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
    .ajout { display: flex; gap: 10px; flex-wrap: wrap; }
    .ajout input, .ajout select { flex: 1 1 160px; padding: 10px 12px; border: 1.5px solid #d9e3dd; border-radius: 12px; font: inherit; font-size: 14px; background: var(--white); }
    .ajout--multi input { flex-basis: 100%; }
    .link-button--danger { color: var(--danger); font-size: 14px; }
  `,
})
export class AdminStructureComponent {
  protected readonly structure = inject(StructureService);
  protected readonly message = signal<string | null>(null);

  protected nouvelleUfr = '';
  protected nouvelleFiliere = '';
  protected ufrFiliere = this.structure.ufrs()[0]?.nom ?? '';
  protected nouveauNiveau = '';
  protected nouvelleMatiere = '';
  protected filiereMatiere = this.structure.filieres()[0]?.nom ?? '';
  protected niveauMatiere = this.structure.niveaux()[0]?.nom ?? '';

  protected ajouterUfr(): void {
    this.structure.ajouterUfr(this.nouvelleUfr.trim());
    this.nouvelleUfr = '';
    this.message.set('UFR ajoutée.');
  }

  protected supprimerUfr(nom: string): void {
    this.structure.supprimerUfr(nom);
    this.message.set('UFR supprimée.');
  }

  protected ajouterFiliere(): void {
    this.structure.ajouterFiliere(this.nouvelleFiliere.trim(), this.ufrFiliere);
    this.nouvelleFiliere = '';
    this.message.set('Filière ajoutée.');
  }

  protected supprimerFiliere(nom: string): void {
    this.structure.supprimerFiliere(nom);
    this.message.set('Filière supprimée.');
  }

  protected ajouterNiveau(): void {
    this.structure.ajouterNiveau(this.nouveauNiveau.trim());
    this.nouveauNiveau = '';
    this.message.set('Niveau ajouté.');
  }

  protected supprimerNiveau(nom: string): void {
    this.structure.supprimerNiveau(nom);
    this.message.set('Niveau supprimé.');
  }

  protected ajouterMatiere(): void {
    this.structure.ajouterMatiere(this.nouvelleMatiere.trim(), this.filiereMatiere, this.niveauMatiere);
    this.nouvelleMatiere = '';
    this.message.set('Matière ajoutée.');
  }

  protected supprimerMatiere(nom: string): void {
    this.structure.supprimerMatiere(nom);
    this.message.set('Matière supprimée.');
  }
}
