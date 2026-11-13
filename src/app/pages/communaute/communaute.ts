import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-communaute',
  imports: [RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Communauté</p>
        <h1 class="page__title">Entraide <span class="accent">entre étudiants</span></h1>
        <p class="page__lead">Jangalma repose sur l'entraide : chacun aide les autres avec ce qu'il maîtrise.</p>

        <div class="grid-3">
          <div class="card"><h2 class="h2">Partager</h2><p class="muted">Dépose tes cours, TD et corrigés pour aider les promotions suivantes.</p></div>
          <div class="card"><h2 class="h2">Accompagner</h2><p class="muted">Deviens tuteur si tu as un niveau d'avance dans une matière.</p></div>
        </div>

        <p style="margin-top: 32px"><a class="btn btn--primary" routerLink="/ressources">Voir les ressources</a></p>
      </div>
    </section>
  `,
})
export class CommunauteComponent {}
