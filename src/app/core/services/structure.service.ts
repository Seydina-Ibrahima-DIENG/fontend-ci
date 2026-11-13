import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  API_BASE,
  CoursResponse,
  FiliereResponse,
  NiveauResponse,
  PageReponse,
  UfrResponse,
  messageErreur,
} from '../api/api';
import { Filiere, Matiere, Niveau, Ufr } from '../models/models';

/** Taille demandée pour les listes : le catalogue est petit, une seule page suffit. */
const TAILLE_LISTE = 100;

/**
 * Structure pédagogique : UFR > filière > niveau > matière (cours), lue depuis academic-service.
 */
@Injectable({ providedIn: 'root' })
export class StructureService {
  private readonly http = inject(HttpClient);

  readonly ufrs = signal<Ufr[]>([]);
  readonly filieres = signal<Filiere[]>([]);
  readonly niveaux = signal<Niveau[]>([]);
  readonly matieres = signal<Matiere[]>([]);

  constructor() {
    void this.charger();
  }

  /** Recharge UFR, filières, niveaux et matières. Une liste en échec reste vide. */
  async charger(): Promise<void> {
    const [ufrs, filieres, niveaux, cours] = await Promise.all([
      firstValueFrom(this.http.get<UfrResponse[]>(`${API_BASE}/ufrs`)).catch(() => []),
      firstValueFrom(this.http.get<FiliereResponse[]>(`${API_BASE}/filieres`)).catch(() => []),
      firstValueFrom(this.http.get<NiveauResponse[]>(`${API_BASE}/niveaux`)).catch(() => []),
      firstValueFrom(this.http.get<PageReponse<CoursResponse>>(`${API_BASE}/cours`, { params: { size: TAILLE_LISTE } }))
        .then((p) => p.content)
        .catch(() => []),
    ]);
    this.ufrs.set(ufrs.map((u) => ({ id: u.id, nom: u.nom })));
    this.filieres.set(
      filieres.map((f) => ({
        id: f.id,
        nom: f.nom,
        description: f.description ?? undefined,
        ufrId: f.ufrId,
        ufrNom: f.ufrNom,
      })),
    );
    this.niveaux.set(niveaux.map((n) => ({ id: n.id, code: n.code, nom: n.libelle })));
    this.matieres.set(
      cours.map((c) => ({
        id: c.id,
        nom: c.nom,
        filiere: c.filiereNom,
        filiereId: c.filiereId,
        niveau: c.niveauLibelle,
        niveauId: c.niveauId,
        volumeHoraire: c.volumeHoraire,
      })),
    );
  }

  ajouterUfr(nom: string): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.post(`${API_BASE}/ufrs`, { nom })));
  }

  supprimerUfr(id: number): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.delete(`${API_BASE}/ufrs/${id}`)));
  }

  ajouterFiliere(nom: string, ufrId: number, description = ''): Promise<string | null> {
    return this.envoyer(() =>
      firstValueFrom(this.http.post(`${API_BASE}/filieres`, { nom, ufrId, description: description || null })),
    );
  }

  supprimerFiliere(id: number): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.delete(`${API_BASE}/filieres/${id}`)));
  }

  ajouterNiveau(code: string, libelle: string): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.post(`${API_BASE}/niveaux`, { code, libelle })));
  }

  supprimerNiveau(id: number): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.delete(`${API_BASE}/niveaux/${id}`)));
  }

  ajouterMatiere(nom: string, filiereId: number, niveauId: number, volumeHoraire: number): Promise<string | null> {
    return this.envoyer(() =>
      firstValueFrom(this.http.post(`${API_BASE}/cours`, { nom, filiereId, niveauId, volumeHoraire })),
    );
  }

  supprimerMatiere(id: number): Promise<string | null> {
    return this.envoyer(() => firstValueFrom(this.http.delete(`${API_BASE}/cours/${id}`)));
  }

  private async envoyer(requete: () => Promise<unknown>): Promise<string | null> {
    try {
      await requete();
      await this.charger();
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }
}
