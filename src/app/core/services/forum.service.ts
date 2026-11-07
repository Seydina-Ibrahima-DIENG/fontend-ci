import { Injectable, signal } from '@angular/core';
import { Question, Reponse } from '../models/models';

/** Forum questions-réponses (F5.1 à F5.3, F5.5). */
@Injectable({ providedIn: 'root' })
export class ForumService {
  readonly questions = signal<Question[]>([
    {
      id: 1,
      auteurId: 1,
      matiere: 'Algorithmique',
      titre: 'Différence entre une pile et une file dans un exercice de TD',
      texte: 'Dans le TD 2, je n\'arrive pas à savoir quand utiliser une pile plutôt qu\'une file. Quelqu\'un a une astuce ?',
      date: '2026-11-06',
      reponses: [
        { id: 1, auteurId: 2, texte: 'Pile = dernier arrivé, premier sorti (LIFO) ; file = premier arrivé, premier sorti (FIFO). Regarde l\'ordre de traitement demandé.', date: '2026-11-06' },
        { id: 2, auteurId: 3, texte: 'Pense au parcours en profondeur (pile) et en largeur (file).', date: '2026-11-07' },
      ],
      meilleureReponseId: 1,
    },
    {
      id: 2,
      auteurId: 6,
      matiere: 'Bases de données',
      titre: 'Comment écrire une jointure externe gauche ?',
      texte: 'Je dois lister tous les étudiants même ceux sans note. Comment écrire le LEFT JOIN ?',
      date: '2026-11-07',
      reponses: [
        { id: 3, auteurId: 2, texte: 'SELECT e.nom, n.note FROM etudiants e LEFT JOIN notes n ON n.etudiant_id = e.id;', date: '2026-11-07' },
      ],
    },
  ]);

  matieres(): string[] {
    return [...new Set(this.questions().map((q) => q.matiere))].sort();
  }

  trouver(id: number): Question | undefined {
    return this.questions().find((q) => q.id === id);
  }

  ajouterQuestion(auteurId: number, matiere: string, titre: string, texte: string): Question {
    const id = Math.max(0, ...this.questions().map((q) => q.id)) + 1;
    const q: Question = { id, auteurId, matiere, titre, texte, date: new Date().toISOString().slice(0, 10), reponses: [] };
    this.questions.update((l) => [q, ...l]);
    return q;
  }

  repondre(questionId: number, auteurId: number, texte: string): void {
    this.questions.update((l) =>
      l.map((q) => {
        if (q.id !== questionId) return q;
        const id = Math.max(0, ...l.flatMap((x) => x.reponses.map((r) => r.id))) + 1;
        const r: Reponse = { id, auteurId, texte, date: new Date().toISOString().slice(0, 10) };
        return { ...q, reponses: [...q.reponses, r] };
      }),
    );
  }

  /** Seul l'auteur de la question choisit la meilleure réponse (F5.3). */
  choisirMeilleure(questionId: number, reponseId: number): void {
    this.questions.update((l) => l.map((q) => (q.id === questionId ? { ...q, meilleureReponseId: reponseId } : q)));
  }

  supprimerQuestion(id: number): void {
    this.questions.update((l) => l.filter((q) => q.id !== id));
  }

  supprimerReponse(questionId: number, reponseId: number): void {
    this.questions.update((l) =>
      l.map((q) => (q.id === questionId ? { ...q, reponses: q.reponses.filter((r) => r.id !== reponseId) } : q)),
    );
  }
}
