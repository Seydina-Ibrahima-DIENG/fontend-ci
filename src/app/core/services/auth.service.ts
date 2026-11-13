import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  API_BASE,
  InscriptionInstitutionnelleResponse,
  LoginResponse,
  ProfilUtilisateurResponse,
  messageErreur,
  roleDepuis,
} from '../api/api';
import { Role, Utilisateur } from '../models/models';
import { ecrireToken, lireToken, rolesDuJeton } from './session';

/** Compte connecté pour la première fois : il doit choisir son mot de passe avant tout. */
export interface PremiereConnexion {
  prenom: string;
}

/**
 * Authentification branchée sur identity-service (JWT).
 * Le token est gardé dans le navigateur ; le profil est rechargé au démarrage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Utilisateur connecté, ou null pour un visiteur. */
  readonly courant = signal<Utilisateur | null>(null);

  /** Renseigné entre la connexion avec un mot de passe temporaire et son remplacement. */
  readonly premiereConnexion = signal<PremiereConnexion | null>(null);

  readonly estConnecte = computed(() => this.courant() !== null);
  readonly role = computed<Role | null>(() => this.courant()?.role ?? null);

  /** Résolu quand la session initiale est restaurée (ou qu'il n'y en a pas). Les gardes l'attendent. */
  readonly pret: Promise<void>;

  constructor() {
    const token = lireToken();
    if (!token) {
      this.pret = Promise.resolve();
    } else if (rolesDuJeton(token).includes('PREMIERE_CONNEXION')) {
      // Jeton limité : /utilisateurs/me le refuserait. On restaure l'état sans appel réseau.
      this.premiereConnexion.set({ prenom: '' });
      this.pret = Promise.resolve();
    } else {
      this.pret = this.chargerProfil();
    }
  }

  /** Renvoie l'erreur à afficher, ou null si la connexion a réussi. */
  async connecter(email: string, motDePasse: string): Promise<string | null> {
    try {
      const reponse = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE}/auth/login`, { email, motDePasse }),
      );
      if (reponse.roles.includes('PREMIERE_CONNEXION')) {
        // Jeton limité : il ne sert qu'à changer le mot de passe.
        ecrireToken(reponse.accessToken);
        this.premiereConnexion.set({ prenom: reponse.prenom });
        return null;
      }
      ecrireToken(reponse.accessToken);
      this.courant.set(depuisLogin(reponse));
      return null;
    } catch (err) {
      return messageErreur(err, 'Email ou mot de passe incorrect.');
    }
  }

  /** Remplace le mot de passe temporaire ; ouvre la session complète. */
  async changerMotDePasseInitial(nouveauMotDePasse: string): Promise<string | null> {
    try {
      const reponse = await firstValueFrom(
        this.http.put<LoginResponse>(`${API_BASE}/auth/premiere-connexion/mot-de-passe`, { nouveauMotDePasse }),
      );
      ecrireToken(reponse.accessToken);
      this.premiereConnexion.set(null);
      this.courant.set(depuisLogin(reponse));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  deconnecter(): void {
    ecrireToken(null);
    this.premiereConnexion.set(null);
    this.courant.set(null);
  }

  /**
   * Inscription d'un étudiant ou d'un enseignant à partir de son matricule et de son email
   * institutionnels. Le backend renvoie un mot de passe temporaire à changer à la connexion.
   */
  async inscriptionInstitutionnelle(
    matricule: string,
    email: string,
  ): Promise<{ erreur: string | null; reponse?: InscriptionInstitutionnelleResponse }> {
    try {
      const reponse = await firstValueFrom(
        this.http.post<InscriptionInstitutionnelleResponse>(`${API_BASE}/auth/inscription-institutionnelle`, {
          matricule,
          email,
        }),
      );
      return { erreur: null, reponse };
    } catch (err) {
      return { erreur: messageErreur(err) };
    }
  }

  /** Met à jour le profil de l'utilisateur connecté (nom, prénom, téléphone). */
  async mettreAJourProfil(changements: { prenom: string; nom: string; telephone: string }): Promise<string | null> {
    try {
      const profil = await firstValueFrom(
        this.http.put<ProfilUtilisateurResponse>(`${API_BASE}/utilisateurs/me`, changements),
      );
      this.courant.set(depuisProfil(profil));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  private async chargerProfil(): Promise<void> {
    try {
      const profil = await firstValueFrom(this.http.get<ProfilUtilisateurResponse>(`${API_BASE}/utilisateurs/me`));
      this.courant.set(depuisProfil(profil));
    } catch (err) {
      // Seul un refus d'authentification invalide le jeton. Une erreur réseau ou serveur
      // ne doit pas déconnecter l'utilisateur : le jeton reste en place pour le prochain rechargement.
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        ecrireToken(null);
      }
      this.courant.set(null);
    }
  }
}

function depuisLogin(r: LoginResponse): Utilisateur {
  return {
    id: r.utilisateurId,
    nom: `${r.prenom} ${r.nom}`,
    prenom: r.prenom,
    nomFamille: r.nom,
    email: r.email,
    telephone: '',
    role: roleDepuis(r.roles),
    statut: 'actif',
  };
}

function depuisProfil(p: ProfilUtilisateurResponse): Utilisateur {
  return {
    id: p.id,
    nom: `${p.prenom} ${p.nom}`,
    prenom: p.prenom,
    nomFamille: p.nom,
    email: p.email,
    telephone: p.telephone ?? '',
    role: roleDepuis(p.roles),
    statut: p.statut === 'ACTIF' ? 'actif' : 'suspendu',
  };
}
