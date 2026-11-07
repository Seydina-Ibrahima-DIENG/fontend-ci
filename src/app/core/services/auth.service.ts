import { Injectable, computed, inject, signal } from '@angular/core';
import { Role, Utilisateur } from '../models/models';
import { UtilisateurService } from './utilisateur.service';

/**
 * Authentification simulée.
 * Le backend remplacera login/inscription par de vrais appels (JWT, cookies…).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly utilisateurs = inject(UtilisateurService);

  /** Utilisateur connecté, ou null pour un visiteur. */
  readonly courant = signal<Utilisateur | null>(null);

  readonly estConnecte = computed(() => this.courant() !== null);
  readonly role = computed<Role | null>(() => this.courant()?.role ?? null);

  /** Renvoie null si succès, sinon un message d'erreur. */
  connecter(email: string, motDePasse: string): string | null {
    const u = this.utilisateurs.trouverParEmail(email);
    if (!u || u.motDePasse !== motDePasse) return 'Email ou mot de passe incorrect.';
    if (u.statut === 'suspendu') return 'Ce compte est suspendu. Contacte l\'administration.';
    this.courant.set(u);
    return null;
  }

  connecterDemo(role: Role): void {
    const u = this.utilisateurs.utilisateurs().find((x) => x.role === role && x.statut === 'actif');
    if (u) this.courant.set(u);
  }

  deconnecter(): void {
    this.courant.set(null);
  }

  /** Renvoie null si succès, sinon un message d'erreur. */
  inscrire(data: { nom: string; email: string; motDePasse: string; ufr: string; filiere: string; niveau: string }): string | null {
    if (this.utilisateurs.trouverParEmail(data.email)) return 'Un compte existe déjà avec cet email.';
    const nouveau = this.utilisateurs.ajouter({ ...data, role: 'etudiant' });
    this.courant.set(nouveau);
    return null;
  }

  /** Simulation : renvoie toujours un succès (l'email réel viendra du backend). */
  demanderReinitialisation(email: string): boolean {
    return !!this.utilisateurs.trouverParEmail(email);
  }

  /** Met à jour le profil de l'utilisateur connecté. */
  mettreAJourProfil(changements: Partial<Utilisateur>): void {
    const u = this.courant();
    if (!u) return;
    this.utilisateurs.mettreAJour(u.id, changements);
    this.courant.set({ ...u, ...changements });
  }
}
