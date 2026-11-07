import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="page page--narrow">
      <div class="page__inner empty-page">
        <p class="page__eyebrow">Erreur 404</p>
        <h1 class="page__title">Page introuvable</h1>
        <p class="page__lead">Cette page n'existe pas, ou elle a été déplacée.</p>
        <a class="btn btn--primary" routerLink="/">Retour à l'accueil</a>
      </div>
    </section>
  `,
  styles: `
    .empty-page { text-align: center; }
    .empty-page .page__lead { margin-left: auto; margin-right: auto; }
  `,
})
export class NotFoundComponent {}
