import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LieuSeance } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { TuteurService } from '../../core/services/tuteur.service';
import { UtilisateurService } from '../../core/services/utilisateur.service';

@Component({
  selector: 'app-tuteur-reserver',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <a class="link-button" [routerLink]="['/tuteur', id]">← Retour au profil</a>

        @if (tuteur(); as t) {
          <p class="page__eyebrow" style="margin-top: 20px">Réservation</p>
          <h1 class="page__title">Réserver avec {{ t.nom }}</h1>
          <p class="page__lead">Choisis une matière, un créneau et le lieu. Le tuteur accepte, refuse ou reporte ta demande.</p>

          <form class="card form" (ngSubmit)="valider()">
            <label class="champ">
              <span class="champ__label">Matière</span>
              <select name="matiere" required [(ngModel)]="matiere">
                <option value="">Choisis une matière</option>
                @for (m of t.matieres; track m) { <option [value]="m">{{ m }}</option> }
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Créneau</span>
              <select name="dispo" required [(ngModel)]="dispoId">
                <option [ngValue]="null">Choisis un créneau</option>
                @for (d of dispos(); track d.id) { <option [ngValue]="d.id">{{ d.jour }} · {{ d.debut }} – {{ d.fin }}</option> }
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Date de la séance</span>
              <input type="date" name="date" required [(ngModel)]="date" />
            </label>

            <label class="champ">
              <span class="champ__label">Lieu ou mode</span>
              <select name="lieu" required [(ngModel)]="lieu">
                <option value="Bibliothèque universitaire">Bibliothèque universitaire</option>
                <option value="En ligne (WhatsApp)">En ligne (WhatsApp)</option>
              </select>
            </label>

            <label class="champ">
              <span class="champ__label">Message pour le tuteur</span>
              <textarea name="message" [(ngModel)]="message" placeholder="Ex. Je bloque sur les listes chaînées du TD 2."></textarea>
            </label>

            @if (erreur()) {
              <p class="alert alert--erreur" role="alert">{{ erreur() }}</p>
            }

            <button type="submit" class="btn btn--primary">Envoyer la demande</button>
          </form>
        } @else {
          <div class="empty" style="margin-top: 24px"><p>Ce tuteur n'est pas disponible.</p></div>
        }
      </div>
    </section>
  `,
  styles: `
    .form { display: grid; gap: 18px; }
  `,
})
export class TuteurReserverComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly users = inject(UtilisateurService);
  private readonly tuteurService = inject(TuteurService);
  private readonly auth = inject(AuthService);

  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly tuteur = computed(() => {
    const u = this.users.trouverParId(this.id);
    return u && u.role === 'tuteur' ? u : undefined;
  });

  protected readonly dispos = computed(() => this.tuteurService.disponibilitesDe(this.id));

  protected matiere = '';
  protected dispoId: number | null = null;
  protected date = '';
  protected lieu: LieuSeance = 'Bibliothèque universitaire';
  protected message = '';
  protected readonly erreur = signal<string | null>(null);

  protected valider(): void {
    const u = this.auth.courant();
    if (!u) {
      this.router.navigateByUrl('/connexion');
      return;
    }
    if (!this.matiere || this.dispoId === null || !this.date) {
      this.erreur.set('Choisis une matière, un créneau et une date.');
      return;
    }
    this.tuteurService.reserver({
      etudiantId: u.id,
      tuteurId: this.id,
      matiere: this.matiere,
      disponibiliteId: this.dispoId,
      dateSeance: this.date,
      lieu: this.lieu,
      message: this.message.trim(),
    });
    this.router.navigateByUrl('/mes-seances');
  }
}
