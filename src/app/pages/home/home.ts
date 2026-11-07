import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Pilier {
  titre: string;
  texte: string;
  icone: 'book' | 'users' | 'bolt';
}

interface Categorie {
  titre: string;
  texte: string;
}

interface Etape {
  numero: string;
  titre: string;
  texte: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [RouterLink],
})
export class HomeComponent {
  protected readonly piliers: Pilier[] = [
    {
      titre: 'Ressources pédagogiques',
      texte: 'Cours, TD, TP, corrigés et sujets d\'examen classés par UFR, filière, niveau et matière.',
      icone: 'book',
    },
    {
      titre: 'Entraide entre étudiants',
      texte: 'Pose tes questions dans un espace par matière et reçois de l\'aide de camarades plus avancés.',
      icone: 'users',
    },
    {
      titre: 'Tutorats personnalisés',
      texte: 'Choisis un tuteur pour ta matière, réserve un créneau qui te convient et suis tes séances.',
      icone: 'bolt',
    },
  ];

  protected readonly categories: Categorie[] = [
    { titre: 'Cours', texte: 'Supports de cours par matière et par niveau.' },
    { titre: 'Travaux dirigés', texte: 'TD et TP avec leurs énoncés pour t\'entraîner.' },
    { titre: 'Corrigés', texte: 'Solutions détaillées pour vérifier ton raisonnement.' },
    { titre: 'Sujets d\'examen', texte: 'Anciens sujets pour préparer tes examens.' },
    { titre: 'Résumés', texte: 'Fiches de révision rédigées par des étudiants.' },
    { titre: 'Recherche rapide', texte: 'Trouve un document en quelques clics avec les filtres.' },
  ];

  protected readonly etapes: Etape[] = [
    {
      numero: '01',
      titre: 'Cherche',
      texte: 'Trouve la ressource ou le tuteur dont tu as besoin pour ta matière.',
    },
    {
      numero: '02',
      titre: 'Réserve',
      texte: 'Choisis un créneau disponible et envoie ta demande de séance.',
    },
    {
      numero: '03',
      titre: 'Progresse',
      texte: 'Assiste à la séance, puis note ton tuteur pour aider les autres étudiants.',
    },
  ];
}
