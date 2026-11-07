import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LIBELLES_TYPE, Ressource, TypeRessource } from '../../core/models/ressource.model';
import { RessourceService } from '../../core/services/ressource.service';
import { StructureService } from '../../core/services/structure.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ressources',
  imports: [FormsModule, RouterLink],
  templateUrl: './ressources.html',
  styleUrl: './ressources.css',
})
export class RessourcesComponent {
  private readonly service = inject(RessourceService);
  private readonly structure = inject(StructureService);
  protected readonly auth = inject(AuthService);

  protected readonly libellesType = LIBELLES_TYPE;

  /** Ressources publiées (store réactif). */
  protected readonly toutes = this.service.publiees;

  // ---- Filtres (F3.4) ----
  protected readonly recherche = signal('');
  protected readonly filtreUfr = signal('');
  protected readonly filtreFiliere = signal('');
  protected readonly filtreNiveau = signal('');
  protected readonly filtreMatiere = signal('');
  protected readonly filtreType = signal<TypeRessource | ''>('');
  protected readonly filtreAnnee = signal('');

  protected readonly ufrs = computed(() => this.structure.ufrs().map((u) => u.nom));
  protected readonly filieres = computed(() =>
    this.structure.filieres().filter((f) => !this.filtreUfr() || f.ufr === this.filtreUfr()).map((f) => f.nom),
  );
  protected readonly niveaux = computed(() => this.uniques((r) => r.niveau));
  protected readonly matieres = computed(() => this.uniques((r) => r.matiere));
  protected readonly annees = computed(() =>
    [...new Set(this.toutes().map((r) => String(r.annee)))].sort((a, b) => Number(b) - Number(a)),
  );
  protected readonly types = Object.keys(LIBELLES_TYPE) as TypeRessource[];

  /** Arborescence UFR > filière > matières (F2.2) pour naviguer sans formulaire. */
  protected readonly arborescence = computed(() =>
    this.structure.ufrs().map((u) => ({
      nom: u.nom,
      filieres: this.structure
        .filieres()
        .filter((f) => f.ufr === u.nom)
        .map((f) => ({
          nom: f.nom,
          matieres: this.structure.matieres().filter((m) => m.filiere === f.nom).map((m) => m.nom),
        })),
    })),
  );

  /** Résultats après recherche et filtres. */
  protected readonly resultats = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    return this.toutes().filter((r) => {
      if (terme && !`${r.titre} ${r.matiere} ${r.filiere}`.toLowerCase().includes(terme)) return false;
      if (this.filtreUfr() && r.ufr !== this.filtreUfr()) return false;
      if (this.filtreFiliere() && r.filiere !== this.filtreFiliere()) return false;
      if (this.filtreNiveau() && r.niveau !== this.filtreNiveau()) return false;
      if (this.filtreMatiere() && r.matiere !== this.filtreMatiere()) return false;
      if (this.filtreType() && r.type !== this.filtreType()) return false;
      if (this.filtreAnnee() && String(r.annee) !== this.filtreAnnee()) return false;
      return true;
    });
  });

  protected readonly filtresActifs = computed(
    () =>
      !!(
        this.recherche() ||
        this.filtreUfr() ||
        this.filtreFiliere() ||
        this.filtreNiveau() ||
        this.filtreMatiere() ||
        this.filtreType() ||
        this.filtreAnnee()
      ),
  );

  // ---- Favoris (F3.7, état local en attendant le backend) ----
  protected readonly favoris = signal<Set<number>>(new Set());

  protected toggleFavori(id: number): void {
    this.favoris.update((ensemble) => {
      const copie = new Set(ensemble);
      if (copie.has(id)) copie.delete(id);
      else copie.add(id);
      return copie;
    });
  }

  protected telecharger(r: Ressource): void {
    this.service.incrementerTelechargements(r.id);
  }

  protected choisirFiliere(nom: string): void {
    this.filtreFiliere.set(nom);
    this.filtreMatiere.set('');
  }

  protected choisirMatiere(nom: string): void {
    this.filtreMatiere.set(nom);
    const m = this.structure.matieres().find((x) => x.nom === nom);
    if (m) {
      this.filtreFiliere.set(m.filiere);
      const f = this.structure.filieres().find((x) => x.nom === m.filiere);
      if (f) this.filtreUfr.set(f.ufr);
    }
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.filtreUfr.set('');
    this.filtreFiliere.set('');
    this.filtreNiveau.set('');
    this.filtreMatiere.set('');
    this.filtreType.set('');
    this.filtreAnnee.set('');
  }

  private uniques(extraire: (r: Ressource) => string): string[] {
    return [...new Set(this.toutes().map(extraire))].sort();
  }
}
