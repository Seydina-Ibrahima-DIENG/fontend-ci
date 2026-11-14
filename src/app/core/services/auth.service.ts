import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  API_BASE,
  InscriptionRequest,
  LoginResponse,
  ProfilUtilisateurResponse,
  messageErreur,
  roleDepuis,
} from '../api/api';
import { Role, Utilisateur } from '../models/models';
import { ecrireToken, lireToken } from './session';

/**
 * Authentification branchée sur identity-service (JWT).
 * Le token est gardé dans le navigateur ; le profil est rechargé au démarrage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Utilisateur connecté, ou null pour un visiteur. */
  readonly courant = signal<Utilisateur | null>(null);

  readonly estConnecte = computed(() => this.courant() !== null);
  readonly role = computed<Role | null>(() => this.courant()?.role ?? null);

  /** Résolu quand la session initiale est restaurée (ou qu'il n'y en a pas). Les gardes l'attendent. */
  readonly pret: Promise<void>;

  constructor() {
    this.pret = lireToken() ? this.chargerProfil() : Promise.resolve();
  }

  /** Renvoie l'erreur à afficher, ou null si la connexion a réussi. */
  async connecter(email: string, motDePasse: string): Promise<string | null> {
    try {
      const reponse = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE}/auth/login`, { email, motDePasse }),
      );
      this.ouvrirSession(reponse);
      return null;
    } catch (err) {
      return messageErreur(err, 'Email ou mot de passe incorrect.');
    }
  }

  /**
   * Inscription libre d'un étudiant ou d'un enseignant (email @uadb.edu.sn obligatoire, vérifié
   * par le backend). Le compte est actif tout de suite : la session est ouverte avec le jeton reçu.
   * Renvoie l'erreur à afficher, ou null si l'inscription a réussi.
   */
  async inscrire(demande: InscriptionRequest): Promise<string | null> {
    try {
      const reponse = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE}/auth/inscription`, demande),
      );
      this.ouvrirSession(reponse);
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  deconnecter(): void {
    ecrireToken(null);
    this.courant.set(null);
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

  private ouvrirSession(reponse: LoginResponse): void {
    ecrireToken(reponse.accessToken);
    this.courant.set(depuisLogin(reponse));
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
