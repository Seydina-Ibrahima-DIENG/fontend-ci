import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected readonly links: NavLink[] = [
    { label: 'Accueil', href: '/' },
    { label: 'Ressources', href: '/ressources' },
    { label: 'Tuteur', href: '/tuteur' },
    { label: 'Communauté', href: '/communaute' },
    { label: 'À propos', href: '/a-propos' },
  ];

  protected readonly menuOuvert = signal(false);

  protected fermerMenu(): void {
    this.menuOuvert.set(false);
  }

  protected toggleMenu(): void {
    this.menuOuvert.update((v) => !v);
  }
}
