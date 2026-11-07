import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Navigation commune aux pages d'administration. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="admin-nav" aria-label="Administration">
      <a routerLink="/admin" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="admin-nav__item--actif">Tableau de bord</a>
      <a routerLink="/admin/utilisateurs" routerLinkActive="admin-nav__item--actif">Utilisateurs</a>
      <a routerLink="/admin/moderation" routerLinkActive="admin-nav__item--actif">Modération</a>
      <a routerLink="/admin/structure" routerLinkActive="admin-nav__item--actif">Structure</a>
    </nav>
  `,
  styles: `
    .admin-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
    .admin-nav a {
      padding: 9px 18px; border-radius: 999px; border: 1.5px solid var(--line);
      background: var(--white); font-size: 14px; font-weight: 600; color: var(--text-600);
    }
    .admin-nav a:hover { border-color: var(--green-700); color: var(--green-900); }
    .admin-nav__item--actif { background: var(--green-900) !important; border-color: var(--green-900) !important; color: var(--white) !important; }
  `,
})
export class AdminNavComponent {}
