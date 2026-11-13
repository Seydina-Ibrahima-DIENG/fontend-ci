import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavLink {
  label: string;
  href: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly notifService = inject(NotificationService);
  private readonly router = inject(Router);

  constructor() {
    // Les notifications suivent la session : chargées à la connexion, vidées à la déconnexion.
    effect(() => {
      const u = this.auth.courant();
      if (u) void this.notifService.charger(u.id);
      else this.notifService.vider();
    });
  }

  protected readonly links: NavLink[] = [
    { label: 'Accueil', href: '/' },
    { label: 'Ressources', href: '/ressources' },
    { label: 'Tuteur', href: '/tuteur' },
    { label: 'Communauté', href: '/communaute' },
    { label: 'À propos', href: '/a-propos' },
  ];

  protected readonly menuOuvert = signal(false);

  /** Accueil de l'espace selon le rôle. */
  protected espaceHref(): string {
    return this.auth.role() === 'admin' ? '/admin' : '/mes-seances';
  }

  protected nonLues(): number {
    return this.notifService.nonLues();
  }

  protected deconnecter(): void {
    this.auth.deconnecter();
    this.menuOuvert.set(false);
    this.router.navigateByUrl('/');
  }

  protected fermerMenu(): void {
    this.menuOuvert.set(false);
  }

  protected toggleMenu(): void {
    this.menuOuvert.update((v) => !v);
  }
}
