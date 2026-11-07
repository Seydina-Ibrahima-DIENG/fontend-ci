import { Component } from '@angular/core';

@Component({
  selector: 'app-a-propos',
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">À propos</p>
        <h1 class="page__title">Jangalma</h1>
        <p class="page__lead">
          Jangalma est une plateforme pour les étudiants de l'Université Alioune Diop de Bambey (UADB).
          Elle centralise les ressources pédagogiques et organise le tutorat entre pairs.
        </p>

        <div class="card">
          <h2 class="h2">Notre objectif</h2>
          <p class="muted">Améliorer la réussite et l'entraide académique, avec un outil simple et utilisable depuis un téléphone, même avec une connexion limitée.</p>
        </div>
      </div>
    </section>
  `,
})
export class AProposComponent {}
