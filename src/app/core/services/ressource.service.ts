import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ressource } from '../models/ressource.model';
import { Signalement } from '../models/models';

/**
 * Service de ressources.
 * Pour l'instant il renvoie des données de démonstration en mémoire.
 * Il sera remplacé par un appel HTTP vers le backend quand il existera.
 */
@Injectable({ providedIn: 'root' })
export class RessourceService {
  private readonly donnees: Ressource[] = [
    {
      id: 1,
      titre: 'Algorithmique et structures de données — session 1',
      type: 'sujet',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 2',
      matiere: 'Algorithmique',
      annee: 2025,
      format: 'PDF',
      tailleKo: 1250,
      deposePar: 'Enseignant',
      telechargements: 214,
    },
    {
      id: 2,
      titre: 'TD 2 : listes chaînées et piles — corrigé',
      type: 'corrige',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 2',
      matiere: 'Algorithmique',
      annee: 2026,
      format: 'PDF',
      tailleKo: 640,
      deposePar: 'Tuteur',
      telechargements: 97,
    },
    {
      id: 3,
      titre: 'Cours : complexité algorithmique',
      type: 'cours',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 2',
      matiere: 'Algorithmique',
      annee: 2026,
      format: 'PDF',
      tailleKo: 2800,
      deposePar: 'Tuteur',
      telechargements: 156,
    },
    {
      id: 4,
      titre: 'TP 1 : implémenter un tri fusion en Python',
      type: 'tp',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 2',
      matiere: 'Algorithmique',
      annee: 2026,
      format: 'PDF',
      tailleKo: 310,
      deposePar: 'Enseignant',
      telechargements: 61,
    },
    {
      id: 5,
      titre: 'Bases de données : requêtes SQL — examen 2024',
      type: 'sujet',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 3',
      matiere: 'Bases de données',
      annee: 2024,
      format: 'PDF',
      tailleKo: 980,
      deposePar: 'Enseignant',
      telechargements: 133,
    },
    {
      id: 6,
      titre: 'Analyse 1 : fiche de révision — limites et continuité',
      type: 'resume',
      ufr: 'UFR SATIC',
      filiere: 'Mathématiques',
      niveau: 'Licence 1',
      matiere: 'Analyse 1',
      annee: 2025,
      format: 'PDF',
      tailleKo: 420,
      deposePar: 'Tuteur',
      telechargements: 88,
    },
    {
      id: 7,
      titre: 'Réseaux : examen 2025, session 1',
      type: 'sujet',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 3',
      matiere: 'Réseaux',
      annee: 2025,
      format: 'PDF',
      tailleKo: 1100,
      deposePar: 'Enseignant',
      telechargements: 45,
    },
    {
      id: 8,
      titre: 'Travaux dirigés : suites numériques',
      type: 'td',
      ufr: 'UFR SATIC',
      filiere: 'Mathématiques',
      niveau: 'Licence 1',
      matiere: 'Analyse 1',
      annee: 2026,
      format: 'DOCX',
      tailleKo: 180,
      deposePar: 'Tuteur',
      telechargements: 29,
    },
  ];

  /** Store réactif des ressources (mock, en mémoire). */
  readonly ressources = signal<Ressource[]>(this.donnees);

  /** Ressources publiées, visibles par tous. */
  readonly publiees = computed(() => this.ressources().filter((r) => !r.statut || r.statut === 'publiee'));

  /** Ressources en attente de validation (F3.3). */
  readonly enAttente = computed(() => this.ressources().filter((r) => r.statut === 'en_attente'));

  getRessources(): Observable<Ressource[]> {
    return of(this.publiees());
  }

  trouver(id: number): Ressource | undefined {
    return this.ressources().find((r) => r.id === id);
  }

  /** Dépôt d'une ressource (F3.1) : elle reste en attente tant qu'elle n'est pas validée. */
  deposer(data: Omit<Ressource, 'id' | 'telechargements' | 'statut'>): Ressource {
    const id = Math.max(0, ...this.ressources().map((r) => r.id)) + 1;
    const r: Ressource = { ...data, id, telechargements: 0, statut: 'en_attente' };
    this.ressources.update((l) => [r, ...l]);
    return r;
  }

  valider(id: number): void {
    this.ressources.update((l) => l.map((r) => (r.id === id ? { ...r, statut: 'publiee' } : r)));
  }

  rejeter(id: number): void {
    this.ressources.update((l) => l.map((r) => (r.id === id ? { ...r, statut: 'rejetee' } : r)));
  }

  supprimer(id: number): void {
    this.ressources.update((l) => l.filter((r) => r.id !== id));
  }

  // ---------- Signalements (F3.8, F7.2) ----------
  readonly signalements = signal<Signalement[]>([
    { id: 1, ressourceId: 6, motif: 'Le contenu ne correspond pas à la matière indiquée.', statut: 'ouvert' },
  ]);

  signaler(ressourceId: number, motif: string): void {
    const id = Math.max(0, ...this.signalements().map((s) => s.id)) + 1;
    this.signalements.update((l) => [...l, { id, ressourceId, motif, statut: 'ouvert' }]);
  }

  traiterSignalement(id: number): void {
    this.signalements.update((l) => l.map((s) => (s.id === id ? { ...s, statut: 'traite' } : s)));
  }

  /** Compteur de téléchargements (F3.6). */
  incrementerTelechargements(id: number): void {
    this.ressources.update((l) => l.map((r) => (r.id === id ? { ...r, telechargements: r.telechargements + 1 } : r)));
  }
}
