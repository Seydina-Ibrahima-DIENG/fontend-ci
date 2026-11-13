import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AvisResponse, AvisResumeResponse, TuteurProfilResponse } from '../../core/api/api';
import { AuthService } from '../../core/services/auth.service';
import { StructureService } from '../../core/services/structure.service';
import { TutoratService } from '../../core/services/tutorat.service';

@Component({
  selector: 'app-tuteur-profil',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="page__inner">
        <a class="link-button" routerLink="/tuteur">← Tous les tuteurs</a>

        @if (chargement()) {
          <p class="muted" style="margin-top: 24px">Chargement…</p>
        } @else if (tuteur(); as t) {
          <div class="layout" style="margin-top: 24px">
            <div class="stack">
              <div class="card">
                <div class="entete">
                  <span class="avatar">T{{ t.id }}</span>
                  <div>
                    <h1 class="page__title" style="font-size: clamp(26px, 3.4vw, 36px); margin-bottom: 4px">Tuteur n°{{ t.id }}</h1>
                    <p class="note">★ {{ moyenne() }} <span class="muted">({{ resume()?.nombreAvis ?? 0 }} avis)</span></p>
                  </div>
                </div>

                @if (t.description) {
                  <p class="description">{{ t.description }}</p>
                }

                <h2 class="h2">Matières</h2>
                <div class="row">
                  @for (m of matieres(); track m) { <span class="badge">{{ m }}</span> }
                </div>
              </div>

              <div class="card">
                <h2 class="h2">Avis des étudiants</h2>
                @if (avis().length === 0) {
                  <p class="muted">Aucun avis pour l'instant.</p>
                } @else {
                  <ul class="avis">
                    @for (a of avis(); track a.id) {
                      <li>
                        <p class="avis__entete"><strong>★ {{ a.note }}/5</strong></p>
                        @if (a.commentaire) { <p class="muted">{{ a.commentaire }}</p> }
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>

            <aside class="stack">
              <div class="card">
                @if (auth.estConnecte()) {
                  <a class="btn btn--primary" style="width: 100%" [routerLink]="['/tuteur', t.id, 'reserver']">Réserver une séance</a>
                } @else {
                  <a class="btn btn--primary" style="width: 100%" routerLink="/connexion">Connecte-toi pour réserver</a>
                }
              </div>
            </aside>
          </div>
        } @else {
          <div class="empty" style="margin-top: 24px"><p>Ce tuteur n'existe pas ou n'est plus disponible.</p></div>
        }
      </div>
    </section>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .entete { display: flex; gap: 18px; align-items: center; margin-bottom: 20px; }
    .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--green-900); color: var(--white); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 22px; font-weight: 700; flex-shrink: 0; }
    .note { margin: 6px 0 0; font-weight: 700; color: var(--green-900); }
    .description { line-height: 1.7; color: var(--text-600); }
    .avis { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
    .avis__entete { margin: 0 0 4px; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class TuteurProfilComponent {
  protected readonly auth = inject(AuthService);
  private readonly structure = inject(StructureService);
  private readonly tutorat = inject(TutoratService);
  private readonly route = inject(ActivatedRoute);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly chargement = signal(true);
  protected readonly tuteur = signal<TuteurProfilResponse | undefined>(undefined);
  protected readonly avis = signal<AvisResponse[]>([]);
  protected readonly resume = signal<AvisResumeResponse | undefined>(undefined);

  constructor() {
    void this.charger();
  }

  protected matieres(): string[] {
    const ids = this.tuteur()?.coursIds ?? [];
    return ids.map((id) => this.structure.matieres().find((m) => m.id === id)?.nom).filter((n): n is string => !!n);
  }

  protected moyenne(): string | number {
    const n = this.resume()?.noteMoyenne;
    return n ? Math.round(n * 10) / 10 : '—';
  }

  private async charger(): Promise<void> {
    const [t, avis, resume] = await Promise.all([
      this.tutorat.consulter(this.id),
      this.tutorat.avisDe(this.id),
      this.tutorat.resumeAvis(this.id),
    ]);
    this.tuteur.set(t);
    this.avis.set(avis);
    this.resume.set(resume);
    this.chargement.set(false);
  }
}
