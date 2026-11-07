import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home';
import { RessourcesComponent } from './pages/ressources/ressources';
import { RessourceDetailComponent } from './pages/ressource-detail/ressource-detail';
import { RessourceDepotComponent } from './pages/ressource-depot/ressource-depot';
import { ConnexionComponent } from './pages/connexion/connexion';
import { InscriptionComponent } from './pages/inscription/inscription';
import { MotDePasseOublieComponent } from './pages/mot-de-passe-oublie/mot-de-passe-oublie';
import { TuteursComponent } from './pages/tuteurs/tuteurs';
import { TuteurProfilComponent } from './pages/tuteur-profil/tuteur-profil';
import { TuteurReserverComponent } from './pages/tuteur-reserver/tuteur-reserver';
import { DevenirTuteurComponent } from './pages/devenir-tuteur/devenir-tuteur';
import { ForumComponent } from './pages/forum/forum';
import { ForumQuestionComponent } from './pages/forum-question/forum-question';
import { MesSeancesComponent } from './pages/mes-seances/mes-seances';
import { EspaceTuteurComponent } from './pages/espace-tuteur/espace-tuteur';
import { ProfilComponent } from './pages/profil/profil';
import { NotificationsComponent } from './pages/notifications/notifications';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminUtilisateursComponent } from './pages/admin-utilisateurs/admin-utilisateurs';
import { AdminModerationComponent } from './pages/admin-moderation/admin-moderation';
import { AdminStructureComponent } from './pages/admin-structure/admin-structure';
import { ConditionsComponent } from './pages/conditions/conditions';
import { CommunauteComponent } from './pages/communaute/communaute';
import { AProposComponent } from './pages/a-propos/a-propos';
import { NotFoundComponent } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Jangalma — Apprendre ensemble, réussir ensemble' },

  // Ressources
  { path: 'ressources', component: RessourcesComponent, title: 'Ressources — Jangalma' },
  { path: 'ressources/depot', component: RessourceDepotComponent, canActivate: [authGuard], title: 'Déposer une ressource — Jangalma' },
  { path: 'ressources/:id', component: RessourceDetailComponent, title: 'Ressource — Jangalma' },

  // Authentification
  { path: 'connexion', component: ConnexionComponent, title: 'Connexion — Jangalma' },
  { path: 'inscription', component: InscriptionComponent, title: 'Inscription — Jangalma' },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublieComponent, title: 'Mot de passe oublié — Jangalma' },

  // Tutorat
  { path: 'tuteur', component: TuteursComponent, title: 'Tuteurs — Jangalma' },
  { path: 'tuteur/:id', component: TuteurProfilComponent, title: 'Tuteur — Jangalma' },
  { path: 'tuteur/:id/reserver', component: TuteurReserverComponent, canActivate: [authGuard], title: 'Réserver une séance — Jangalma' },
  { path: 'devenir-tuteur', component: DevenirTuteurComponent, canActivate: [authGuard], title: 'Devenir tuteur — Jangalma' },

  // Forum
  { path: 'forum', component: ForumComponent, title: 'Forum — Jangalma' },
  { path: 'forum/:id', component: ForumQuestionComponent, title: 'Question — Jangalma' },

  // Espace connecté
  { path: 'mes-seances', component: MesSeancesComponent, canActivate: [authGuard], title: 'Mes séances — Jangalma' },
  { path: 'espace-tuteur', component: EspaceTuteurComponent, canActivate: [roleGuard], data: { roles: ['tuteur'] }, title: 'Espace tuteur — Jangalma' },
  { path: 'profil', component: ProfilComponent, canActivate: [authGuard], title: 'Mon profil — Jangalma' },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard], title: 'Notifications — Jangalma' },

  // Administration
  { path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard], data: { roles: ['admin'] }, title: 'Administration — Jangalma' },
  { path: 'admin/utilisateurs', component: AdminUtilisateursComponent, canActivate: [roleGuard], data: { roles: ['admin'] }, title: 'Utilisateurs — Jangalma' },
  { path: 'admin/moderation', component: AdminModerationComponent, canActivate: [roleGuard], data: { roles: ['admin'] }, title: 'Modération — Jangalma' },
  { path: 'admin/structure', component: AdminStructureComponent, canActivate: [roleGuard], data: { roles: ['admin'] }, title: 'Structure pédagogique — Jangalma' },

  // Pages statiques
  { path: 'conditions', component: ConditionsComponent, title: 'Conditions d\'utilisation — Jangalma' },
  { path: 'communaute', component: CommunauteComponent, title: 'Communauté — Jangalma' },
  { path: 'a-propos', component: AProposComponent, title: 'À propos — Jangalma' },

  { path: '**', component: NotFoundComponent, title: 'Page introuvable — Jangalma' },
];
