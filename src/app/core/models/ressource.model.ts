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

export interface Ressource {
  id: number;
  titre: string;
  type: TypeRessource;
  ufr: string;
  filiere: string;
  niveau: string;
  matiere: string;
  annee: number;
  format: 'PDF' | 'DOCX' | 'PPTX';
  tailleKo: number;
  deposePar: string;
  telechargements: number;
}
