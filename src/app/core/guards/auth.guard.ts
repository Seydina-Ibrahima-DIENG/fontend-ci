import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

/** Accès réservé aux utilisateurs connectés. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.pret;
  return auth.estConnecte() ? true : router.createUrlTree(['/connexion']);
};

/** Accès réservé à certains rôles, défini par `data: { roles: [...] }` sur la route. */
export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.pret;
  if (!auth.estConnecte()) return router.createUrlTree(['/connexion']);
  const roles = (route.data['roles'] ?? []) as Role[];
  return roles.includes(auth.role() as Role) ? true : router.createUrlTree(['/']);
};
