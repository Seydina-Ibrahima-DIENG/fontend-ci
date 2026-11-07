import { Component, inject, signal } from '@angular/core';
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
    const u = this.auth.courant();
    return u ? this.notifService.nonLuesPour(u.id) : 0;
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
