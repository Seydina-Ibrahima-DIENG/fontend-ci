import { Injectable, signal } from '@angular/core';
import { Filiere, Matiere, Niveau, Ufr } from '../models/models';

/**
 * Structure pédagogique : UFR > filière > niveau > matière (F2.1, F2.2).
 * Données mockées ; l'admin peut ajouter, modifier et supprimer.
 */
@Injectable({ providedIn: 'root' })
export class StructureService {
  readonly ufrs = signal<Ufr[]>([
    { nom: 'UFR SATIC' },
    { nom: 'UFR Sciences Économiques' },
  ]);

  readonly filieres = signal<Filiere[]>([
    { nom: 'Informatique', ufr: 'UFR SATIC' },
    { nom: 'Mathématiques', ufr: 'UFR SATIC' },
    { nom: 'Statistiques', ufr: 'UFR SATIC' },
    { nom: 'Gestion', ufr: 'UFR Sciences Économiques' },
  ]);

  readonly niveaux = signal<Niveau[]>([
    { nom: 'Licence 1' },
    { nom: 'Licence 2' },
    { nom: 'Licence 3' },
    { nom: 'Master 1' },
    { nom: 'Master 2' },
  ]);

  readonly matieres = signal<Matiere[]>([
    { nom: 'Algorithmique', filiere: 'Informatique', niveau: 'Licence 2' },
    { nom: 'Bases de données', filiere: 'Informatique', niveau: 'Licence 3' },
    { nom: 'Réseaux', filiere: 'Informatique', niveau: 'Licence 3' },
    { nom: 'Python', filiere: 'Informatique', niveau: 'Licence 2' },
    { nom: 'Linux', filiere: 'Informatique', niveau: 'Master 1' },
    { nom: 'Analyse 1', filiere: 'Mathématiques', niveau: 'Licence 1' },
    { nom: 'Statistiques', filiere: 'Statistiques', niveau: 'Master 1' },
  ]);

  ajouterUfr(nom: string): void {
    this.ufrs.update((l) => [...l, { nom }]);
  }

  supprimerUfr(nom: string): void {
    this.ufrs.update((l) => l.filter((u) => u.nom !== nom));
  }

  ajouterFiliere(nom: string, ufr: string): void {
    this.filieres.update((l) => [...l, { nom, ufr }]);
  }

  supprimerFiliere(nom: string): void {
    this.filieres.update((l) => l.filter((f) => f.nom !== nom));
  }

  ajouterNiveau(nom: string): void {
    this.niveaux.update((l) => [...l, { nom }]);
  }

  supprimerNiveau(nom: string): void {
    this.niveaux.update((l) => l.filter((n) => n.nom !== nom));
  }

  ajouterMatiere(nom: string, filiere: string, niveau: string): void {
    this.matieres.update((l) => [...l, { nom, filiere, niveau }]);
  }

  supprimerMatiere(nom: string): void {
    this.matieres.update((l) => l.filter((m) => m.nom !== nom));
  }
}
