import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE, PageReponse, RessourceEntity, SignalementResponse, messageErreur } from '../api/api';
import { Ressource } from '../models/ressource.model';
import { StructureService } from './structure.service';

/** Taille demandée pour les listes (catalogue encore petit). */
const TAILLE_LISTE = 100;

/** Données envoyées pour un dépôt (multipart : le fichier est obligatoire). */
export interface DepotRessource {
  titre: string;
  description: string;
  type: string;
  coursId: number;
  auteurId: number;
  fichier: File;
}

/**
 * Bibliothèque de ressources, lue depuis resource-service.
 * Chaque ressource est enrichie de la matière, filière et niveau de son cours.
 */
@Injectable({ providedIn: 'root' })
export class RessourceService {
  private readonly http = inject(HttpClient);
  private readonly structure = inject(StructureService);

  /** Données brutes renvoyées par l'API, publiées ou non selon l'appel. */
  private readonly brutes = signal<RessourceEntity[]>([]);
  private readonly enAttenteBrutes = signal<RessourceEntity[]>([]);

  /** Ressources publiées, visibles par tous. */
  readonly publiees = computed(() => this.brutes().map((e) => this.versAffichage(e)));

  /** Ressources en attente de validation (administration). */
  readonly enAttente = computed(() => this.enAttenteBrutes().map((e) => this.versAffichage(e)));

  /** Signalements remontés par les utilisateurs (administration). */
  readonly signalements = signal<SignalementResponse[]>([]);

  constructor() {
    void this.charger();
  }

  /** Recharge la bibliothèque publiée. */
  async charger(): Promise<void> {
    try {
      await this.structure.charger();
      const page = await firstValueFrom(
        this.http.get<PageReponse<RessourceEntity>>(`${API_BASE}/ressources`, { params: { size: TAILLE_LISTE } }),
      );
      this.brutes.set(page.content);
    } catch {
      this.brutes.set([]);
    }
  }

  /** Charge la file de validation (rôle administrateur). */
  async chargerEnAttente(): Promise<void> {
    try {
      this.enAttenteBrutes.set(
        await firstValueFrom(this.http.get<RessourceEntity[]>(`${API_BASE}/ressources/admin/en-attente`)),
      );
    } catch {
      this.enAttenteBrutes.set([]);
    }
  }

  /** Charge les signalements (administration). */
  async chargerSignalements(): Promise<void> {
    try {
      this.signalements.set(await firstValueFrom(this.http.get<SignalementResponse[]>(`${API_BASE}/signalements`)));
    } catch {
      this.signalements.set([]);
    }
  }

  /** Fiche d'une ressource publiée (renvoie undefined si absente ou non publiée). */
  async obtenir(id: number): Promise<Ressource | undefined> {
    try {
      if (this.structure.matieres().length === 0) await this.structure.charger();
      const e = await firstValueFrom(this.http.get<RessourceEntity>(`${API_BASE}/ressources/${id}`));
      return this.versAffichage(e);
    } catch {
      return undefined;
    }
  }

  trouver(id: number): Ressource | undefined {
    return this.publiees().find((r) => r.id === id);
  }

  /** Dépôt d'une ressource avec son fichier (F3.1). Elle reste en attente de validation. */
  async deposer(data: DepotRessource): Promise<string | null> {
    const corps = new FormData();
    corps.append('titre', data.titre);
    if (data.description) corps.append('description', data.description);
    corps.append('type', data.type);
    corps.append('coursId', String(data.coursId));
    corps.append('auteurId', String(data.auteurId));
    corps.append('fichier', data.fichier, data.fichier.name);
    try {
      await firstValueFrom(this.http.post(`${API_BASE}/ressources`, corps));
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  /** Télécharge le fichier de la ressource (le jeton est envoyé par l'intercepteur). */
  async telechargerFichier(r: Ressource): Promise<string | null> {
    try {
      const blob = await firstValueFrom(
        this.http.get(`${API_BASE}/ressources/${r.id}/fichier`, { responseType: 'blob' }),
      );
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = r.nomFichier ?? `ressource-${r.id}`;
      lien.click();
      URL.revokeObjectURL(url);
      void this.charger();
      return null;
    } catch (err) {
      return messageErreur(err, 'Le fichier est indisponible.');
    }
  }

  /** Validation par l'administration (F3.3). */
  async valider(id: number, validateurId: number): Promise<string | null> {
    return this.action(() =>
      firstValueFrom(this.http.put(`${API_BASE}/ressources/admin/${id}/valider`, null, { params: { validateurId } })),
    );
  }

  async rejeter(id: number, validateurId: number, motif: string): Promise<string | null> {
    return this.action(() =>
      firstValueFrom(
        this.http.put(`${API_BASE}/ressources/admin/${id}/rejeter`, null, { params: { validateurId, motif } }),
      ),
    );
  }

  async supprimer(id: number): Promise<string | null> {
    return this.action(() => firstValueFrom(this.http.delete(`${API_BASE}/ressources/${id}`)));
  }

  /** Signalement d'une ressource par un utilisateur connecté (F3.8). */
  async signaler(ressourceId: number, utilisateurId: number, motif: string, description = ''): Promise<string | null> {
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE}/ressources/${ressourceId}/signalements`, {
          utilisateurId,
          motif,
          description: description || null,
        }),
      );
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  /** Traitement d'un signalement par l'administration (F7.2). */
  async traiterSignalement(id: number, statut: 'TRAITE' | 'REJETE'): Promise<string | null> {
    return this.action(() =>
      firstValueFrom(this.http.put(`${API_BASE}/signalements/${id}/statut`, null, { params: { statut } })),
    );
  }

  /** Exécute une action d'écriture puis recharge les listes concernées. */
  private async action(requete: () => Promise<unknown>): Promise<string | null> {
    try {
      await requete();
      await Promise.all([this.charger(), this.chargerEnAttente(), this.chargerSignalements()]);
      return null;
    } catch (err) {
      return messageErreur(err);
    }
  }

  private versAffichage(e: RessourceEntity): Ressource {
    const cours = this.structure.matieres().find((m) => m.id === e.coursId);
    return {
      id: e.id,
      titre: e.titre,
      type: e.type as Ressource['type'],
      description: e.description ?? undefined,
      coursId: e.coursId,
      matiere: cours?.nom ?? '—',
      filiere: cours?.filiere ?? '—',
      niveau: cours?.niveau ?? '—',
      annee: new Date(e.dateCreation).getFullYear(),
      auteurId: e.auteurId,
      dateCreation: e.dateCreation,
      nomFichier: e.nomFichier,
      telechargements: e.telechargements,
      statut: e.statutPublication,
      motifRejet: e.motifRejet,
    };
  }
}
