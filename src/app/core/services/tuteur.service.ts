import { Injectable, inject, signal } from '@angular/core';
import { Disponibilite, LieuSeance, Seance, Avis } from '../models/models';
import { NotificationService } from './notification.service';
import { UtilisateurService } from './utilisateur.service';

/**
 * Tutorat : disponibilités (F4.2), demandes de séance (F4.4),
 * acceptation / refus / report (F4.5), statuts (F4.6), avis (F4.8).
 */
@Injectable({ providedIn: 'root' })
export class TuteurService {
  private readonly notifications = inject(NotificationService);
  private readonly utilisateurs = inject(UtilisateurService);

  readonly disponibilites = signal<Disponibilite[]>([
    { id: 1, tuteurId: 2, jour: 'Lundi', debut: '17:00', fin: '18:00' },
    { id: 2, tuteurId: 2, jour: 'Mercredi', debut: '16:00', fin: '17:00' },
    { id: 3, tuteurId: 2, jour: 'Samedi', debut: '10:00', fin: '11:00' },
    { id: 4, tuteurId: 3, jour: 'Jeudi', debut: '17:00', fin: '18:00' },
    { id: 5, tuteurId: 4, jour: 'Mardi', debut: '18:00', fin: '19:00' },
  ]);

  readonly seances = signal<Seance[]>([
    {
      id: 1,
      etudiantId: 1,
      tuteurId: 2,
      matiere: 'Algorithmique',
      disponibiliteId: 1,
      dateSeance: '2026-11-09',
      lieu: 'Bibliothèque universitaire',
      message: 'Je bloque sur les listes chaînées du TD 2.',
      statut: 'confirmee',
    },
    {
      id: 2,
      etudiantId: 1,
      tuteurId: 3,
      matiere: 'Réseaux',
      disponibiliteId: 4,
      dateSeance: '2026-11-05',
      lieu: 'En ligne (WhatsApp)',
      message: 'Révision des protocoles TCP/IP.',
      statut: 'terminee',
      avis: { note: 5, commentaire: 'Séance claire et ponctuelle.' },
    },
    {
      id: 3,
      etudiantId: 6,
      tuteurId: 2,
      matiere: 'Bases de données',
      disponibiliteId: 3,
      dateSeance: '2026-11-14',
      lieu: 'Bibliothèque universitaire',
      message: 'Jointures externes, je ne comprends pas bien la différence.',
      statut: 'en_attente',
    },
  ]);

  // ---------- Disponibilités ----------
  disponibilitesDe(tuteurId: number): Disponibilite[] {
    return this.disponibilites().filter((d) => d.tuteurId === tuteurId);
  }

  ajouterDisponibilite(tuteurId: number, jour: string, debut: string, fin: string): void {
    const id = Math.max(0, ...this.disponibilites().map((d) => d.id)) + 1;
    this.disponibilites.update((l) => [...l, { id, tuteurId, jour, debut, fin }]);
  }

  supprimerDisponibilite(id: number): void {
    this.disponibilites.update((l) => l.filter((d) => d.id !== id));
  }

  // ---------- Demandes et séances ----------
  reserver(data: { etudiantId: number; tuteurId: number; matiere: string; disponibiliteId: number; dateSeance: string; lieu: LieuSeance; message: string }): Seance {
    const id = Math.max(0, ...this.seances().map((s) => s.id)) + 1;
    const seance: Seance = { ...data, id, statut: 'en_attente' };
    this.seances.update((l) => [...l, seance]);
    const etudiant = this.utilisateurs.trouverParId(data.etudiantId);
    this.notifications.pousser(data.tuteurId, `Nouvelle demande de séance de ${etudiant?.nom ?? 'un étudiant'} en ${data.matiere}.`);
    return seance;
  }

  seancesDe(userId: number): Seance[] {
    return this.seances()
      .filter((s) => s.etudiantId === userId || s.tuteurId === userId)
      .sort((a, b) => b.dateSeance.localeCompare(a.dateSeance));
  }

  /** Acceptation, refus ou report d'une demande par le tuteur (F4.5). */
  repondre(seanceId: number, action: 'accepter' | 'refuser' | 'reporter', nouvelleDispoId?: number): void {
    const s = this.seances().find((x) => x.id === seanceId);
    if (!s) return;
    if (action === 'accepter') {
      this.majSeance(seanceId, { statut: 'confirmee' });
      this.notifications.pousser(s.etudiantId, `Ta séance de ${s.matiere} est confirmée.`);
    } else if (action === 'refuser') {
      this.majSeance(seanceId, { statut: 'annulee' });
      this.notifications.pousser(s.etudiantId, `Ta demande de séance de ${s.matiere} a été refusée.`);
    } else {
      const dispo = this.disponibilites().find((d) => d.id === nouvelleDispoId);
      this.majSeance(seanceId, { statut: 'en_attente', disponibiliteId: nouvelleDispoId ?? s.disponibiliteId });
      this.notifications.pousser(s.etudiantId, `Ta séance de ${s.matiere} a été reportée${dispo ? ` au ${dispo.jour} ${dispo.debut}` : ''}.`);
    }
  }

  /** Marque une séance confirmée comme terminée (F4.6). */
  terminer(seanceId: number): void {
    this.majSeance(seanceId, { statut: 'terminee' });
  }

  annuler(seanceId: number): void {
    this.majSeance(seanceId, { statut: 'annulee' });
  }

  /** Avis de l'étudiant après une séance (F4.8). */
  noter(seanceId: number, avis: Avis): void {
    const s = this.seances().find((x) => x.id === seanceId);
    if (!s) return;
    this.majSeance(seanceId, { avis });
    const tuteur = this.utilisateurs.trouverParId(s.tuteurId);
    if (tuteur) this.utilisateurs.mettreAJour(tuteur.id, { notes: [...tuteur.notes, avis.note] });
  }

  private majSeance(id: number, changements: Partial<Seance>): void {
    this.seances.update((l) => l.map((s) => (s.id === id ? { ...s, ...changements } : s)));
  }
}
