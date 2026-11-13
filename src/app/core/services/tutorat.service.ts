import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  API_BASE,
  AvisResponse,
  AvisResumeResponse,
  DisponibiliteResponse,
  PageReponse,
  SeanceResponse,
  TuteurProfilResponse,
  messageErreur,
} from '../api/api';

/** Jours affichés en français, avec leur valeur java.time.DayOfWeek côté API. */
export const JOURS_API: Record<string, string> = {
  Lundi: 'MONDAY',
  Mardi: 'TUESDAY',
  Mercredi: 'WEDNESDAY',
  Jeudi: 'THURSDAY',
  Vendredi: 'FRIDAY',
  Samedi: 'SATURDAY',
  Dimanche: 'SUNDAY',
};

export interface DemandeSeance {
  tuteurId: number;
  coursId: number;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  mode: 'PRESENTIEL' | 'DISTANCIEL';
  lieu: string;
  motif: string;
}

/**
 * Tutorat (matching-service) : annuaire, disponibilités, séances, avis.
 *
 * Limite connue : l'API ne renvoie pas le nom des tuteurs ni des étudiants
 * (seulement des identifiants). Les pages affichent un libellé générique tant
 * que le backend n'expose pas ces noms.
 */
@Injectable({ providedIn: 'root' })
export class TutoratService {
  private readonly http = inject(HttpClient);

  // ---------- Annuaire ----------

  async annuaire(): Promise<TuteurProfilResponse[]> {
    try {
      const page = await firstValueFrom(
        this.http.get<PageReponse<TuteurProfilResponse>>(`${API_BASE}/matching/tuteurs`, { params: { size: 100 } }),
      );
      return page.content;
    } catch {
      return [];
    }
  }

  async consulter(id: number): Promise<TuteurProfilResponse | undefined> {
    try {
      return await firstValueFrom(this.http.get<TuteurProfilResponse>(`${API_BASE}/matching/tuteurs/${id}`));
    } catch {
      return undefined;
    }
  }

  async avisDe(tuteurId: number): Promise<AvisResponse[]> {
    try {
      return await firstValueFrom(this.http.get<AvisResponse[]>(`${API_BASE}/matching/tuteurs/${tuteurId}/avis`));
    } catch {
      return [];
    }
  }

  async resumeAvis(tuteurId: number): Promise<AvisResumeResponse | undefined> {
    try {
      return await firstValueFrom(
        this.http.get<AvisResumeResponse>(`${API_BASE}/matching/tuteurs/${tuteurId}/avis/resume`),
      );
    } catch {
      return undefined;
    }
  }

  /** Profil tuteur de l'utilisateur connecté, ou null s'il n'en a pas. */
  async monProfil(): Promise<TuteurProfilResponse | null> {
    try {
      return await firstValueFrom(this.http.get<TuteurProfilResponse>(`${API_BASE}/matching/tuteurs/moi`));
    } catch {
      return null;
    }
  }

  // ---------- Disponibilités (tuteur connecté) ----------

  async disponibilites(): Promise<DisponibiliteResponse[]> {
    try {
      return await firstValueFrom(
        this.http.get<DisponibiliteResponse[]>(`${API_BASE}/matching/tuteurs/moi/disponibilites`),
      );
    } catch {
      return [];
    }
  }

  /** Renvoie null si succès, sinon un message d'erreur. */
  async ajouterDisponibilite(jour: string, heureDebut: string, heureFin: string): Promise<string | null> {
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE}/matching/tuteurs/moi/disponibilites`, {
          jour: JOURS_API[jour],
          heureDebut,
          heureFin,
          disponible: true,
        }),
      );
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  async supprimerDisponibilite(id: number): Promise<string | null> {
    try {
      await firstValueFrom(this.http.delete(`${API_BASE}/matching/tuteurs/moi/disponibilites/${id}`));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  // ---------- Séances ----------

  /** Demandes envoyées par l'étudiant connecté. */
  async seancesEtudiant(): Promise<SeanceResponse[]> {
    return this.lire(`${API_BASE}/matching/seances/mes-demandes`);
  }

  /** Séances reçues par le tuteur connecté. */
  async seancesTuteur(): Promise<SeanceResponse[]> {
    return this.lire(`${API_BASE}/matching/seances/mes-seances-tuteur`);
  }

  async demander(data: DemandeSeance): Promise<string | null> {
    return this.ecrire(() => firstValueFrom(this.http.post(`${API_BASE}/matching/seances`, data)));
  }

  async accepter(id: number): Promise<string | null> {
    return this.ecrire(() => firstValueFrom(this.http.put(`${API_BASE}/matching/seances/${id}/accepter`, null)));
  }

  async refuser(id: number, motif: string): Promise<string | null> {
    return this.ecrire(() =>
      firstValueFrom(this.http.put(`${API_BASE}/matching/seances/${id}/refuser`, { motif: motif || null })),
    );
  }

  async annuler(id: number, motif = ''): Promise<string | null> {
    return this.ecrire(() =>
      firstValueFrom(this.http.put(`${API_BASE}/matching/seances/${id}/annuler`, { motif: motif || null })),
    );
  }

  async terminer(id: number): Promise<string | null> {
    return this.ecrire(() => firstValueFrom(this.http.put(`${API_BASE}/matching/seances/${id}/terminer`, null)));
  }

  /** Avis de l'étudiant après une séance terminée (F4.8). */
  async deposerAvis(seanceId: number, note: number, commentaire: string): Promise<string | null> {
    return this.ecrire(() =>
      firstValueFrom(
        this.http.post(`${API_BASE}/matching/seances/${seanceId}/avis`, { note, commentaire: commentaire || null }),
      ),
    );
  }

  private async lire<T>(url: string): Promise<T[]> {
    try {
      return await firstValueFrom(this.http.get<T[]>(url));
    } catch {
      return [];
    }
  }

  private async ecrire(requete: () => Promise<unknown>): Promise<string | null> {
    try {
      await requete();
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }
}
