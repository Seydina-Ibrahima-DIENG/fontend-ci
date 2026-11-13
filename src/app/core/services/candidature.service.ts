import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE, CandidatureTuteurResponse, messageErreur } from '../api/api';

/**
 * Candidatures pour devenir tuteur (F1.6, F1.7), identity-service.
 * Une candidature approuvée ajoute le rôle TUTEUR, effectif à la prochaine connexion.
 */
@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private readonly http = inject(HttpClient);

  /** Renvoie null si succès, sinon un message d'erreur. */
  async deposer(data: { description: string; motivation: string; coursIds: number[] }): Promise<string | null> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE}/tutorat/candidature`, data));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  /** Candidatures de l'utilisateur connecté, les plus récentes d'abord. */
  async mesCandidatures(): Promise<CandidatureTuteurResponse[]> {
    try {
      const liste = await firstValueFrom(
        this.http.get<CandidatureTuteurResponse[]>(`${API_BASE}/tutorat/candidature/moi`),
      );
      return [...liste].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
    } catch {
      return [];
    }
  }

  /** Candidatures en attente (administration). */
  async enAttente(): Promise<CandidatureTuteurResponse[]> {
    try {
      return await firstValueFrom(
        this.http.get<CandidatureTuteurResponse[]>(`${API_BASE}/admin/candidatures-tuteurs/en-attente`),
      );
    } catch {
      return [];
    }
  }

  async approuver(id: number): Promise<string | null> {
    try {
      await firstValueFrom(this.http.put(`${API_BASE}/admin/candidatures-tuteurs/${id}/approuver`, null));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  async refuser(id: number, motif: string): Promise<string | null> {
    try {
      await firstValueFrom(this.http.put(`${API_BASE}/admin/candidatures-tuteurs/${id}/refuser`, { motif }));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }
}
