/* ============================================================
   Modèles métier — Jangalma (données mockées pour l'instant)
   ============================================================ */

export type Role = 'etudiant' | 'tuteur' | 'admin';

export type StatutDemandeTuteur = 'aucune' | 'en_attente' | 'validee' | 'refusee';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  motDePasse: string;
  role: Role;
  ufr: string;
  filiere: string;
  niveau: string;
  statut: 'actif' | 'suspendu';
  demandeTuteur: StatutDemandeTuteur;
  /** Matières maîtrisées (tuteurs ou demandeurs). */
  matieres: string[];
  description?: string;
  justificatif?: string;
  notes: number[];
}

export interface Disponibilite {
  id: number;
  tuteurId: number;
  jour: string;
  debut: string;
  fin: string;
}

export type StatutSeance = 'en_attente' | 'confirmee' | 'terminee' | 'annulee';

export type LieuSeance = 'Bibliothèque universitaire' | 'En ligne (WhatsApp)';

export interface Avis {
  note: number;
  commentaire: string;
}

export interface Seance {
  id: number;
  etudiantId: number;
  tuteurId: number;
  matiere: string;
  disponibiliteId: number;
  dateSeance: string;
  lieu: LieuSeance;
  message: string;
  statut: StatutSeance;
  avis?: Avis;
}

export interface Reponse {
  id: number;
  auteurId: number;
  texte: string;
  date: string;
}

export interface Question {
  id: number;
  auteurId: number;
  matiere: string;
  titre: string;
  texte: string;
  date: string;
  reponses: Reponse[];
  meilleureReponseId?: number;
}

export interface Notification {
  id: number;
  userId: number;
  texte: string;
  date: string;
  lue: boolean;
}

export interface Signalement {
  id: number;
  ressourceId: number;
  motif: string;
  statut: 'ouvert' | 'traite';
}

export interface Ufr {
  nom: string;
}

export interface Filiere {
  nom: string;
  ufr: string;
}

export interface Niveau {
  nom: string;
}

export interface Matiere {
  nom: string;
  filiere: string;
  niveau: string;
}

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
