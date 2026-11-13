/** Types de ressources (cahier des charges F3.2). */
export type TypeRessource = 'cours' | 'td' | 'tp' | 'corrige' | 'sujet' | 'resume';

export const LIBELLES_TYPE: Record<TypeRessource, string> = {
  cours: 'Cours',
  td: 'TD',
  tp: 'TP',
  corrige: 'Corrigé',
  sujet: "Sujet d'examen",
  resume: 'Résumé',
};

/**
 * Ressource telle qu'affichée : la fiche backend (RessourceEntity) enrichie
 * de la matière, filière et niveau du cours auquel elle est rattachée.
 */
export interface Ressource {
  id: number;
  titre: string;
  type: TypeRessource;
  description?: string;
  coursId: number;
  matiere: string;
  filiere: string;
  niveau: string;
  /** Année de dépôt, dérivée de la date de création. */
  annee: number;
  auteurId: number;
  dateCreation: string;
  /** Nom du fichier stocké (absent si la ressource n'a qu'un lien). */
  nomFichier: string | null;
  telechargements: number;
  statut: 'EN_ATTENTE' | 'PUBLIEE' | 'REJETEE';
  motifRejet: string | null;
}
