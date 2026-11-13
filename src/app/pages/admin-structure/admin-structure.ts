import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from '../admin-nav/admin-nav';
import { StructureService } from '../../core/services/structure.service';

/** Structure pédagogique : UFR > filière > niveau > matière (F2.1), branchée sur academic-service. */
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

        @if (message()) { <p class="alert alert--info" style="margin-bottom: 24px" role="status">{{ message() }}</p> }
        @if (erreur()) { <p class="alert alert--erreur" style="margin-bottom: 24px" role="alert">{{ erreur() }}</p> }

        <div class="grid-2">
          <!-- UFR -->
          <div class="card">
            <h2 class="h2">UFR</h2>
            <ul class="items">
              @for (u of structure.ufrs(); track u.id) {
                <li><span>{{ u.nom }}</span><button type="button" class="link-button link-button--danger" (click)="supprimerUfr(u.id)">Supprimer</button></li>
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
              @for (f of structure.filieres(); track f.id) {
                <li><span>{{ f.nom }} <span class="muted">· {{ f.ufrNom }}</span></span><button type="button" class="link-button link-button--danger" (click)="supprimerFiliere(f.id)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout ajout--multi" (ngSubmit)="ajouterFiliere()">
              <input name="nouvelleFiliere" placeholder="Nouvelle filière" [(ngModel)]="nouvelleFiliere" />
              <select name="ufrFiliere" [(ngModel)]="ufrFiliereId">
                <option [ngValue]="null" disabled>Choisis une UFR</option>
                @for (u of structure.ufrs(); track u.id) { <option [ngValue]="u.id">{{ u.nom }}</option> }
              </select>
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouvelleFiliere.trim() || ufrFiliereId === null">Ajouter</button>
            </form>
          </div>

          <!-- Niveaux -->
          <div class="card">
            <h2 class="h2">Niveaux</h2>
            <ul class="items">
              @for (n of structure.niveaux(); track n.id) {
                <li><span>{{ n.nom }} <span class="muted">· {{ n.code }}</span></span><button type="button" class="link-button link-button--danger" (click)="supprimerNiveau(n.id)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout ajout--multi" (ngSubmit)="ajouterNiveau()">
              <input name="codeNiveau" placeholder="Code (ex. L2)" [(ngModel)]="codeNiveau" />
              <input name="nouveauNiveau" placeholder="Libellé (ex. Licence 2)" [(ngModel)]="libelleNiveau" />
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!codeNiveau.trim() || !libelleNiveau.trim()">Ajouter</button>
            </form>
          </div>

          <!-- Matières -->
          <div class="card">
            <h2 class="h2">Matières</h2>
            <ul class="items">
              @for (m of structure.matieres(); track m.id) {
                <li><span>{{ m.nom }} <span class="muted">· {{ m.filiere }} · {{ m.niveau }}</span></span><button type="button" class="link-button link-button--danger" (click)="supprimerMatiere(m.id)">Supprimer</button></li>
              }
            </ul>
            <form class="ajout ajout--multi" (ngSubmit)="ajouterMatiere()">
              <input name="nouvelleMatiere" placeholder="Nouvelle matière" [(ngModel)]="nouvelleMatiere" />
              <select name="filiereMatiere" [(ngModel)]="filiereMatiereId">
                <option [ngValue]="null" disabled>Choisis une filière</option>
                @for (f of structure.filieres(); track f.id) { <option [ngValue]="f.id">{{ f.nom }}</option> }
              </select>
              <select name="niveauMatiere" [(ngModel)]="niveauMatiereId">
                <option [ngValue]="null" disabled>Choisis un niveau</option>
                @for (n of structure.niveaux(); track n.id) { <option [ngValue]="n.id">{{ n.nom }}</option> }
              </select>
              <input name="volume" type="number" min="1" placeholder="Volume horaire" [(ngModel)]="volumeHoraire" />
              <button type="submit" class="btn btn--primary btn--small" [disabled]="!nouvelleMatiere.trim() || filiereMatiereId === null || niveauMatiereId === null">Ajouter</button>
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
  protected readonly erreur = signal<string | null>(null);

  protected nouvelleUfr = '';
  protected nouvelleFiliere = '';
  protected ufrFiliereId: number | null = null;
  protected codeNiveau = '';
  protected libelleNiveau = '';
  protected nouvelleMatiere = '';
  protected filiereMatiereId: number | null = null;
  protected niveauMatiereId: number | null = null;
  protected volumeHoraire = 30;

  protected async ajouterUfr(): Promise<void> {
    await this.executer(() => this.structure.ajouterUfr(this.nouvelleUfr.trim()), 'UFR ajoutée.', () => (this.nouvelleUfr = ''));
  }

  protected async supprimerUfr(id: number): Promise<void> {
    await this.executer(() => this.structure.supprimerUfr(id), 'UFR supprimée.');
  }

  protected async ajouterFiliere(): Promise<void> {
    if (this.ufrFiliereId === null) return;
    const ufrId = this.ufrFiliereId;
    await this.executer(() => this.structure.ajouterFiliere(this.nouvelleFiliere.trim(), ufrId), 'Filière ajoutée.', () => (this.nouvelleFiliere = ''));
  }

  protected async supprimerFiliere(id: number): Promise<void> {
    await this.executer(() => this.structure.supprimerFiliere(id), 'Filière supprimée.');
  }

  protected async ajouterNiveau(): Promise<void> {
    await this.executer(
      () => this.structure.ajouterNiveau(this.codeNiveau.trim(), this.libelleNiveau.trim()),
      'Niveau ajouté.',
      () => {
        this.codeNiveau = '';
        this.libelleNiveau = '';
      },
    );
  }

  protected async supprimerNiveau(id: number): Promise<void> {
    await this.executer(() => this.structure.supprimerNiveau(id), 'Niveau supprimé.');
  }

  protected async ajouterMatiere(): Promise<void> {
    if (this.filiereMatiereId === null || this.niveauMatiereId === null) return;
    const filiereId = this.filiereMatiereId;
    const niveauId = this.niveauMatiereId;
    await this.executer(
      () => this.structure.ajouterMatiere(this.nouvelleMatiere.trim(), filiereId, niveauId, Number(this.volumeHoraire)),
      'Matière ajoutée.',
      () => (this.nouvelleMatiere = ''),
    );
  }

  protected async supprimerMatiere(id: number): Promise<void> {
    await this.executer(() => this.structure.supprimerMatiere(id), 'Matière supprimée.');
  }

  private async executer(action: () => Promise<string | null>, succes: string, apres?: () => void): Promise<void> {
    this.message.set(null);
    this.erreur.set(null);
    const msg = await action();
    if (msg) {
      this.erreur.set(msg);
      return;
    }
    apres?.();
    this.message.set(succes);
  }
}
