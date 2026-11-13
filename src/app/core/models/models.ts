/* ============================================================
   Modèles de l'interface. Les données viennent du backend
   (voir core/api/api.ts).
   ============================================================ */

export type Role = 'etudiant' | 'tuteur' | 'admin';

export type StatutCompte = 'actif' | 'suspendu' | 'en_attente' | 'inactif';

export interface Utilisateur {
  id: number;
  /** Nom affiché : « Prénom Nom ». */
  nom: string;
  prenom: string;
  /** Nom de famille seul (pour l'édition du profil). */
  nomFamille: string;
  email: string;
  telephone: string;
  role: Role;
  statut: StatutCompte;
}

/** Filière (academic-service), rattachée à une UFR. */
export interface Filiere {
  id: number;
  nom: string;
  description?: string;
  ufrId: number;
  ufrNom: string;
}

/** UFR (academic-service). */
export interface Ufr {
  id: number;
  nom: string;
}

/** Niveau (academic-service) : `nom` est le libellé, ex. « Licence 2 ». */
export interface Niveau {
  id: number;
  code: string;
  nom: string;
}

/** Matière = cours (academic-service), rattaché à une filière et à un niveau. */
export interface Matiere {
  id: number;
  nom: string;
  filiere: string;
  filiereId: number;
  niveau: string;
  niveauId: number;
  volumeHoraire: number | null;
}

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
