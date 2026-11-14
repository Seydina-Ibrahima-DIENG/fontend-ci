import { HttpErrorResponse } from '@angular/common/http';
import { Role } from '../models/models';

/**
 * Base des appels REST. En développement, `ng serve` redirige `/api` vers la
 * gateway (voir proxy.conf.json) : pas de CORS à gérer côté navigateur.
 */
export const API_BASE = '/api/v1';

/* ------------------------------------------------------------
   Contrats du backend (backend-ci). Les noms de champs suivent
   les records Java : toute modification côté API doit être
   répercutée ici.
   ------------------------------------------------------------ */

/** identity-service : LoginResponse (login, première connexion) */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  utilisateurId: number;
  nom: string;
  prenom: string;
  email: string;
  roles: string[];
}

/**
 * identity-service : InscriptionRequest (POST /auth/inscription, route publique).
 * Email @uadb.edu.sn obligatoire. La réponse est une LoginResponse : le compte est actif
 * et connecté immédiatement.
 */
export interface InscriptionRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  role: 'ETUDIANT' | 'ENSEIGNANT';
  /** Obligatoire pour un étudiant. */
  codePermanent?: string;
  filiereId?: number;
  niveauId?: number;
  /** Facultatif, pour un enseignant. */
  matriculeProfessionnel?: string;
}

/** identity-service : ProfilUtilisateurResponse (GET/PUT /utilisateurs/me) */
export interface ProfilUtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  statut: string;
  roles: string[];
}

/** identity-service : UtilisateurAdminResponse (élément de GET /admin/utilisateurs) */
export type UtilisateurAdminResponse = ProfilUtilisateurResponse;

/** identity-service : CandidatureTuteurResponse */
export interface CandidatureTuteurResponse {
  id: number;
  utilisateurId: number;
  nom: string;
  prenom: string;
  email: string;
  description: string;
  motivation: string;
  coursIds: number[];
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';
  motifRefus: string | null;
  dateCreation: string;
  dateDecision: string | null;
}

/** Spring Page<T> : seul `content` (et `totalElements`) sont utilisés. */
export interface PageReponse<T> {
  content: T[];
  totalElements: number;
}

/** academic-service */
export interface UfrResponse {
  id: number;
  nom: string;
  dateCreation: string;
}

export interface FiliereResponse {
  id: number;
  nom: string;
  description: string | null;
  dateCreation: string;
  ufrId: number;
  ufrNom: string;
}

export interface NiveauResponse {
  id: number;
  code: string;
  libelle: string;
}

export interface CoursResponse {
  id: number;
  nom: string;
  description: string | null;
  volumeHoraire: number | null;
  filiereId: number;
  filiereNom: string;
  niveauId: number;
  niveauLibelle: string;
}

/** resource-service : RessourceEntity */
export interface RessourceEntity {
  id: number;
  titre: string;
  description: string | null;
  type: string;
  url: string | null;
  coursId: number;
  auteurId: number;
  nomFichier: string | null;
  contentType: string | null;
  taille: number | null;
  telechargements: number;
  statutPublication: 'EN_ATTENTE' | 'PUBLIEE' | 'REJETEE';
  motifRejet: string | null;
  dateCreation: string;
}

/** resource-service : SignalementResponse */
export interface SignalementResponse {
  id: number;
  ressourceId: number;
  titreRessource: string;
  utilisateurId: number;
  motif: string;
  description: string | null;
  statut: 'EN_ATTENTE' | 'TRAITE' | 'REJETE';
  dateCreation: string;
  dateTraitement: string | null;
}

/** matching-service : TuteurProfilResponse (pas de nom : voir la note dans tutorat.service.ts) */
export interface TuteurProfilResponse {
  id: number;
  utilisateurId: number;
  description: string;
  coursIds: number[];
  statut: 'ACTIF' | 'RETIRE';
  dateCreation: string;
}

/** matching-service : DisponibiliteResponse (jour au format java.time.DayOfWeek) */
export interface DisponibiliteResponse {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
}

export type StatutSeanceApi = 'EN_ATTENTE' | 'CONFIRMEE' | 'REFUSEE' | 'ANNULEE' | 'TERMINEE';

/** matching-service : SeanceResponse */
export interface SeanceResponse {
  id: number;
  etudiantId: number;
  tuteurId: number;
  coursId: number;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  mode: 'PRESENTIEL' | 'DISTANCIEL';
  lieu: string | null;
  motif: string | null;
  statut: StatutSeanceApi;
  motifDecision: string | null;
  dateCreation: string;
  dateDecision: string | null;
}

/** matching-service : AvisResponse */
export interface AvisResponse {
  id: number;
  seanceId: number;
  tuteurId: number;
  auteurId: number;
  note: number;
  commentaire: string | null;
  dateCreation: string;
}

/** matching-service : AvisResumeResponse */
export interface AvisResumeResponse {
  tuteurId: number;
  noteMoyenne: number | null;
  nombreAvis: number;
}

/** notification-service : NotificationEntity */
export interface NotificationApi {
  id: number;
  utilisateurId: number;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  dateCreation: string;
}

/**
 * Rôle affiché dans l'interface, déduit des rôles du jeton.
 * Un tuteur est un compte qui a obtenu le rôle TUTEUR (candidature approuvée).
 */
export function roleDepuis(roles: string[]): Role {
  if (roles.includes('ADMINISTRATEUR')) return 'admin';
  if (roles.includes('TUTEUR')) return 'tuteur';
  return 'etudiant';
}

/**
 * Message lisible à partir d'une erreur HTTP. Les services du backend
 * renvoient un champ `message` (ErreurResponse) quand ils savent expliquer.
 */
export function messageErreur(err: unknown, defaut = 'Une erreur est survenue. Réessaie plus tard.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Impossible de joindre le serveur (le backend ou la gateway ne répond pas).';
    const message = err.error?.message;
    if (typeof message === 'string' && message.trim()) return message;
    // Pas de message exploitable : on indique le code HTTP pour pouvoir diagnostiquer.
    return `${defaut} (erreur ${err.status} sur ${err.url?.replace(/^https?:\/\/[^/]+/, '') ?? '?'})`;
  }
  return defaut;
}
