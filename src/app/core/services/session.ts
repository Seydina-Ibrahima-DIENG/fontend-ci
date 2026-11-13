/** Jeton JWT conservé dans le navigateur de l'utilisateur (pas de données partagées). */
const CLE_TOKEN = 'jangalma.token';

/**
 * Rôles inscrits dans le jeton (lus sans vérification de signature : le backend reste
 * seul juge). Permet de restaurer l'état « première connexion » sans appeler l'API.
 */
export function rolesDuJeton(token: string): string[] {
  try {
    const charge = token.split('.')[1];
    const json = atob(charge.replace(/-/g, '+').replace(/_/g, '/'));
    const roles = JSON.parse(json).roles;
    return Array.isArray(roles) ? roles : [];
  } catch {
    return [];
  }
}

export function lireToken(): string | null {
  try {
    return localStorage.getItem(CLE_TOKEN);
  } catch {
    // Stockage indisponible (navigation privée, données bloquées) : session non persistée.
    return null;
  }
}

export function ecrireToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CLE_TOKEN, token);
    else localStorage.removeItem(CLE_TOKEN);
  } catch {
    // Ignoré : l'utilisateur devra se reconnecter après un rechargement.
  }
}
