import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LIBELLES_TYPE } from '../../core/models/ressource.model';
import { RessourceService } from '../../core/services/ressource.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ressource-detail',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <a class="link-button" routerLink="/ressources">← Retour à la bibliothèque</a>

        @if (ressource(); as r) {
          <div class="detail stack" style="margin-top: 24px">
            <div class="card">
              <div class="row" style="margin-bottom: 12px">
                <span class="badge">{{ libelles[r.type] }}</span>
                <span class="badge badge--neutre">{{ r.niveau }}</span>
                <span class="badge badge--neutre">{{ r.annee }}</span>
              </div>

              <h1 class="page__title" style="font-size: clamp(26px, 3.4vw, 38px)">{{ r.titre }}</h1>
              <p class="muted">{{ r.matiere }} · {{ r.ufr }} · {{ r.filiere }}</p>

              @if (r.description) {
                <p class="description">{{ r.description }}</p>
              }

              <dl class="infos">
                <div><dt>Format</dt><dd>{{ r.format }}</dd></div>
                <div><dt>Taille</dt><dd>{{ r.tailleKo }} Ko</dd></div>
                <div><dt>Déposé par</dt><dd>{{ r.deposePar }}</dd></div>
                <div><dt>Téléchargements</dt><dd>{{ compteur() }}</dd></div>
              </dl>

              <div class="row">
                <button type="button" class="btn btn--primary" (click)="telecharger()">Télécharger</button>
              </div>

              @if (messageTelechargement()) {
                <p class="alert alert--info" style="margin-top: 16px">{{ messageTelechargement() }}</p>
              }
            </div>

            <div class="card card--muted">
              <h2 class="h2">Signaler un problème</h2>
              @if (signale()) {
                <p class="alert alert--succes" role="status">Merci : l'équipe de modération va vérifier cette ressource.</p>
              } @else if (!auth.estConnecte()) {
                <p class="muted">
                  <a class="link-button" routerLink="/connexion">Connecte-toi</a> pour signaler une ressource inappropriée ou erronée.
                </p>
              } @else {
                <form class="form" (ngSubmit)="signaler()">
                  <label class="champ">
                    <span class="champ__label">Motif</span>
                    <select name="motif" [(ngModel)]="motif">
                      <option value="">Choisis un motif</option>
                      <option>Contenu inapproprié</option>
                      <option>Document erroné ou incomplet</option>
                      <option>Ne correspond pas à la matière indiquée</option>
                      <option>Droits d'auteur non respectés</option>
                    </select>
                  </label>
                  <button type="submit" class="btn btn--ghost btn--small" [disabled]="!motif">Envoyer le signalement</button>
                </form>
              }
            </div>
          </div>
        } @else {
          <div class="empty" style="margin-top: 24px">
            <p>Cette ressource n'existe pas ou n'est pas encore publiée.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .description { line-height: 1.7; color: var(--text-600); white-space: pre-line; }
    .infos { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 24px 0; }
    .infos dt { font-size: 13px; color: var(--text-600); }
    .infos dd { margin: 4px 0 0; font-weight: 700; color: var(--green-900); }
    .form { display: grid; gap: 14px; }
  `,
})
export class RessourceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RessourceService);
  protected readonly auth = inject(AuthService);

  protected readonly libelles = LIBELLES_TYPE;
  protected readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly ressource = computed(() => {
    const r = this.service.trouver(this.id);
    return r && (!r.statut || r.statut === 'publiee') ? r : undefined;
  });

  protected readonly compteur = computed(() => this.ressource()?.telechargements ?? 0);
  protected readonly messageTelechargement = signal<string | null>(null);
  protected readonly signale = signal(false);
  protected motif = '';

  protected telecharger(): void {
    this.service.incrementerTelechargements(this.id);
    this.messageTelechargement.set('Téléchargement lancé. Le fichier réel sera servi par le backend.');
  }

  protected signaler(): void {
    this.service.signaler(this.id, this.motif);
    this.signale.set(true);
  }
}
