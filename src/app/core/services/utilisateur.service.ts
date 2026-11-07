import { Injectable, signal } from '@angular/core';
import { StatutDemandeTuteur, Utilisateur } from '../models/models';

/**
 * Base d'utilisateurs en mémoire (mock).
 * Sera remplacée par les appels à l'API backend.
 */
@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  readonly utilisateurs = signal<Utilisateur[]>([
    {
      id: 1,
      nom: 'Aminata Ndiaye',
      email: 'etudiant@jangalma.sn',
      motDePasse: 'demo123',
      role: 'etudiant',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 2',
      statut: 'actif',
      demandeTuteur: 'aucune',
      matieres: [],
      notes: [],
    },
    {
      id: 2,
      nom: 'Awa Sarr',
      email: 'tuteur@jangalma.sn',
      motDePasse: 'demo123',
      role: 'tuteur',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Master 1',
      statut: 'actif',
      demandeTuteur: 'validee',
      matieres: ['Algorithmique', 'Python', 'Bases de données'],
      description: "J'aide les étudiants de première et deuxième année à comprendre la logique avant le code : on repart d'un exercice, on le décompose, puis on l'écrit ensemble.",
      notes: [5, 5, 4, 5],
    },
    {
      id: 3,
      nom: 'Moussa Diallo',
      email: 'moussa@jangalma.sn',
      motDePasse: 'demo123',
      role: 'tuteur',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Licence 3',
      statut: 'actif',
      demandeTuteur: 'validee',
      matieres: ['Réseaux', 'Linux'],
      description: 'Je prépare les étudiants aux TP de réseaux et aux examens de Linux.',
      notes: [4, 5],
    },
    {
      id: 4,
      nom: 'Fatou Ndiaye',
      email: 'fatou@jangalma.sn',
      motDePasse: 'demo123',
      role: 'tuteur',
      ufr: 'UFR SATIC',
      filiere: 'Mathématiques',
      niveau: 'Master 1',
      statut: 'actif',
      demandeTuteur: 'validee',
      matieres: ['Analyse 1', 'Statistiques'],
      description: "Analyse et statistiques : je reprends les bases pas à pas avec des exemples concrets.",
      notes: [5, 4, 4],
    },
    {
      id: 5,
      nom: 'Admin Jangalma',
      email: 'admin@jangalma.sn',
      motDePasse: 'demo123',
      role: 'admin',
      ufr: 'Administration',
      filiere: '—',
      niveau: '—',
      statut: 'actif',
      demandeTuteur: 'aucune',
      matieres: [],
      notes: [],
    },
    {
      id: 6,
      nom: 'Ibou Fall',
      email: 'ibou@jangalma.sn',
      motDePasse: 'demo123',
      role: 'etudiant',
      ufr: 'UFR SATIC',
      filiere: 'Informatique',
      niveau: 'Master 1',
      statut: 'actif',
      demandeTuteur: 'en_attente',
      matieres: ['Réseaux', 'Linux'],
      justificatif: 'Relevé de notes M1 (demo)',
      notes: [],
    },
    {
      id: 7,
      nom: 'Khady Mbaye',
      email: 'khady@jangalma.sn',
      motDePasse: 'demo123',
      role: 'etudiant',
      ufr: 'UFR SATIC',
      filiere: 'Statistiques',
      niveau: 'Licence 3',
      statut: 'suspendu',
      demandeTuteur: 'aucune',
      matieres: [],
      notes: [],
    },
  ]);

  trouverParEmail(email: string): Utilisateur | undefined {
    return this.utilisateurs().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  trouverParId(id: number): Utilisateur | undefined {
    return this.utilisateurs().find((u) => u.id === id);
  }

  ajouter(u: Omit<Utilisateur, 'id' | 'notes' | 'statut' | 'demandeTuteur' | 'matieres'>): Utilisateur {
    const nouveau: Utilisateur = {
      ...u,
      id: Math.max(0, ...this.utilisateurs().map((x) => x.id)) + 1,
      statut: 'actif',
      demandeTuteur: 'aucune',
      matieres: [],
      notes: [],
    };
    this.utilisateurs.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  mettreAJour(id: number, changements: Partial<Utilisateur>): void {
    this.utilisateurs.update((liste) => liste.map((u) => (u.id === id ? { ...u, ...changements } : u)));
  }

  supprimer(id: number): void {
    this.utilisateurs.update((liste) => liste.filter((u) => u.id !== id));
  }

  definirDemandeTuteur(id: number, statut: StatutDemandeTuteur): void {
    const u = this.trouverParId(id);
    if (!u) return;
    const changements: Partial<Utilisateur> = { demandeTuteur: statut };
    if (statut === 'validee') changements.role = 'tuteur';
    this.mettreAJour(id, changements);
  }

  tuteurs(): Utilisateur[] {
    return this.utilisateurs().filter((u) => u.role === 'tuteur' && u.statut === 'actif');
  }

  noteMoyenne(u: Utilisateur): number {
    if (!u.notes.length) return 0;
    return Math.round((u.notes.reduce((a, b) => a + b, 0) / u.notes.length) * 10) / 10;
  }
}
