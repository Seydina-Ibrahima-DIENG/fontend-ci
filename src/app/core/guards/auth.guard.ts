import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

/** Accès réservé aux utilisateurs connectés. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.estConnecte() ? true : inject(Router).createUrlTree(['/connexion']);
};

/** Accès réservé à certains rôles, défini par `data: { roles: [...] }` sur la route. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estConnecte()) return router.createUrlTree(['/connexion']);
  const roles = (route.data['roles'] ?? []) as Role[];
  return roles.includes(auth.role() as Role) ? true : router.createUrlTree(['/']);
};
