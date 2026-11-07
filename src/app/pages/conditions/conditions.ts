import { Component } from '@angular/core';

@Component({
  selector: 'app-conditions',
  template: `
    <section class="page page--narrow">
      <div class="page__inner">
        <p class="page__eyebrow">Légal</p>
        <h1 class="page__title">Conditions d'utilisation</h1>
        <p class="page__lead">Version de travail : à valider avec l'encadrement avant la mise en ligne.</p>

        <div class="card texte">
          <h2 class="h2">Contenus déposés</h2>
          <p>Tu ne peux déposer que des documents que tu as le droit de partager. Les contenus protégés sans autorisation sont interdits.</p>

          <h2 class="h2">Validation</h2>
          <p>Chaque ressource est vérifiée par l'équipe ou un enseignant avant publication.</p>

          <h2 class="h2">Signalement et retrait</h2>
          <p>Tout utilisateur peut signaler une ressource inappropriée ou erronée depuis sa page. L'équipe examine le signalement et peut retirer le contenu.</p>

          <h2 class="h2">Comportement</h2>
          <p>Respect entre étudiants et tuteurs. Les propos abusifs sur le forum peuvent être supprimés par la modération.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .texte p { line-height: 1.7; color: var(--text-600); }
    .texte .h2 { margin-top: 24px; }
  `,
})
export class ConditionsComponent {}
