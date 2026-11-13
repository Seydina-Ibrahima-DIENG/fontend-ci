import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE, PageReponse, UtilisateurAdminResponse, roleDepuis } from '../api/api';
import { StatutCompte, Utilisateur } from '../models/models';

/**
 * Comptes utilisateurs, vus par l'administration (identity-service).
 * Un visiteur ou un étudiant n'a accès qu'à son propre profil (AuthService) :
 * la liste ci-dessous reste vide pour eux.
 */
@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly http = inject(HttpClient);

  readonly utilisateurs = signal<Utilisateur[]>([]);

  /** Charge les comptes (rôle administrateur requis). */
  async chargerComptes(): Promise<void> {
    try {
      const page = await firstValueFrom(
        this.http.get<PageReponse<UtilisateurAdminResponse>>(`${API_BASE}/admin/utilisateurs`, {
          params: { taille: 100 },
        }),
      );
      this.utilisateurs.set(page.content.map(depuisAdmin));
    } catch {
      this.utilisateurs.set([]);
    }
  }

  trouverParId(id: number): Utilisateur | undefined {
    return this.utilisateurs().find((u) => u.id === id);
  }
}

function depuisAdmin(u: UtilisateurAdminResponse): Utilisateur {
  return {
    id: u.id,
    nom: `${u.prenom} ${u.nom}`,
    prenom: u.prenom,
    nomFamille: u.nom,
    email: u.email,
    telephone: u.telephone ?? '',
    role: roleDepuis(u.roles),
    statut: statutDepuis(u.statut),
  };
}

function statutDepuis(statut: string): StatutCompte {
  switch (statut) {
    case 'ACTIF':
      return 'actif';
    case 'SUSPENDU':
      return 'suspendu';
    case 'EN_ATTENTE_VALIDATION':
      return 'en_attente';
    default:
      return 'inactif';
  }
}
