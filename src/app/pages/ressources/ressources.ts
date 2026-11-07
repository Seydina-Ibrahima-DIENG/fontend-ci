import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LIBELLES_TYPE, Ressource, TypeRessource } from '../../core/models/ressource.model';
import { RessourceService } from '../../core/services/ressource.service';

@Component({
  selector: 'app-ressources',
  imports: [FormsModule],
  templateUrl: './ressources.html',
  styleUrl: './ressources.css',
})
export class RessourcesComponent {
  private readonly service = inject(RessourceService);

  protected readonly libellesType = LIBELLES_TYPE;

  /** Toutes les ressources (démo). */
  protected readonly toutes = toSignal(this.service.getRessources(), { initialValue: [] as Ressource[] });

  // ---- Filtres ----
  protected readonly recherche = signal('');
  protected readonly filtreNiveau = signal('');
  protected readonly filtreMatiere = signal('');
  protected readonly filtreType = signal<TypeRessource | ''>('');
  protected readonly filtreAnnee = signal('');

  /** Valeurs proposées dans les listes, déduites des données. */
  protected readonly niveaux = computed(() => this.uniques((r) => r.niveau));
  protected readonly matieres = computed(() => this.uniques((r) => r.matiere));
  protected readonly annees = computed(() =>
    [...new Set(this.toutes().map((r) => String(r.annee)))].sort((a, b) => Number(b) - Number(a)),
  );
  protected readonly types = Object.keys(LIBELLES_TYPE) as TypeRessource[];

  /** Résultats après recherche et filtres. */
  protected readonly resultats = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    return this.toutes().filter((r) => {
      if (terme && !`${r.titre} ${r.matiere} ${r.filiere}`.toLowerCase().includes(terme)) return false;
      if (this.filtreNiveau() && r.niveau !== this.filtreNiveau()) return false;
      if (this.filtreMatiere() && r.matiere !== this.filtreMatiere()) return false;
      if (this.filtreType() && r.type !== this.filtreType()) return false;
      if (this.filtreAnnee() && String(r.annee) !== this.filtreAnnee()) return false;
      return true;
    });
  });

  protected readonly filtresActifs = computed(
    () =>
      !!(this.recherche() || this.filtreNiveau() || this.filtreMatiere() || this.filtreType() || this.filtreAnnee()),
  );

  // ---- Favoris et téléchargements (état local, en attendant le backend) ----
  protected readonly favoris = signal<Set<number>>(new Set());
  protected readonly compteurs = signal<Record<number, number>>({});

  protected nbTelechargements(r: Ressource): number {
    return r.telechargements + (this.compteurs()[r.id] ?? 0);
  }

  protected toggleFavori(id: number): void {
    this.favoris.update((ensemble) => {
      const copie = new Set(ensemble);
      if (copie.has(id)) copie.delete(id);
      else copie.add(id);
      return copie;
    });
  }

  protected telecharger(r: Ressource): void {
    this.compteurs.update((c) => ({ ...c, [r.id]: (c[r.id] ?? 0) + 1 }));
  }

  protected reinitialiser(): void {
    this.recherche.set('');
    this.filtreNiveau.set('');
    this.filtreMatiere.set('');
    this.filtreType.set('');
    this.filtreAnnee.set('');
  }

  private uniques(extraire: (r: Ressource) => string): string[] {
    return [...new Set(this.toutes().map(extraire))].sort();
  }
}
