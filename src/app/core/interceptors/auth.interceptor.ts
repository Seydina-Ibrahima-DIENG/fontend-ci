import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE } from '../api/api';
import { lireToken } from '../services/session';

/**
 * Routes publiques : on n'y envoie jamais le jeton. Un jeton périmé ferait
 * rejeter la requête par la gateway, même sur une route publique.
 */
const ROUTES_PUBLIQUES = ['/auth/login', '/auth/inscription'];

/** Ajoute le jeton Bearer aux appels de l'API quand l'utilisateur est connecté. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = lireToken();
  if (!token || !req.url.startsWith(API_BASE)) return next(req);
  if (ROUTES_PUBLIQUES.some((r) => req.url.startsWith(API_BASE + r))) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
