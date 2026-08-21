import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const supportedLanguages = ['en', 'es', 'fr'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const resources = {
  en: {
    translation: {
      title: 'Chess AI',
      localeLabel: 'Language',
      applyLanguage: 'Apply language',
      themeLabel: 'Theme',
      currentTheme: 'Study',
      themeComingSoon: 'Theme selection is coming soon',
      eyebrow: 'A place to play and learn',
      heroTitle: 'Make your next move together.',
      heroDescription:
        'Start a friendly online game, explore open tables, and build your chess practice at your own pace.',
      createGame: 'Create a game',
      browseGames: 'Browse open games',
      learningTitle: 'Learn through every game',
      learningDescription:
        'Courses, guided exercises, and coaching tools are taking shape alongside the board.',
      learningStatus: 'Learning space · coming soon',
      boardLabel: 'Chessboard preview',
      boardCaption: 'A shared board, one thoughtful move at a time.',
      openTables: 'Open tables',
      openTablesDescription: 'Find a player and begin when you are ready.',
      nameDialogTitle: 'Choose your visible name',
      nameDialogDescription:
        'This name will identify you at the table. It must be unique across Chess AI.',
      nameLabel: 'Visible name',
      namePlaceholder: 'For example, QuietKnight',
      cancel: 'Cancel',
      createGameWithName: 'Create game as {{name}}',
      browseGamesWithName: 'Browse games as {{name}}',
      nameRequired: 'Enter a visible name to continue.',
      prototypeNotice:
        'This is a visual prototype. Multiplayer actions will be connected in the next product slice.',
    },
  },
  es: {
    translation: {
      title: 'Chess AI',
      localeLabel: 'Idioma',
      applyLanguage: 'Aplicar idioma',
      themeLabel: 'Tema',
      currentTheme: 'Estudio',
      themeComingSoon: 'La selección de temas estará disponible próximamente',
      eyebrow: 'Un espacio para jugar y aprender',
      heroTitle: 'Haz tu próxima jugada en compañía.',
      heroDescription:
        'Comienza una partida amistosa en línea, explora mesas abiertas y desarrolla tu práctica de ajedrez a tu ritmo.',
      createGame: 'Crear una partida',
      browseGames: 'Ver partidas abiertas',
      learningTitle: 'Aprende en cada partida',
      learningDescription:
        'Cursos, ejercicios guiados y herramientas para entrenadores se desarrollan junto al tablero.',
      learningStatus: 'Espacio de aprendizaje · próximamente',
      boardLabel: 'Vista previa del tablero de ajedrez',
      boardCaption: 'Un tablero compartido, una jugada pensada a la vez.',
      openTables: 'Mesas abiertas',
      openTablesDescription: 'Encuentra a otro jugador y comienza cuando estés listo.',
      nameDialogTitle: 'Elige tu nombre visible',
      nameDialogDescription: 'Este nombre te identificará en la mesa. Debe ser único en Chess AI.',
      nameLabel: 'Nombre visible',
      namePlaceholder: 'Por ejemplo, CaballoTranquilo',
      cancel: 'Cancelar',
      createGameWithName: 'Crear partida como {{name}}',
      browseGamesWithName: 'Ver partidas como {{name}}',
      nameRequired: 'Escribe un nombre visible para continuar.',
      prototypeNotice:
        'Este es un prototipo visual. Las acciones multijugador se conectarán en el próximo incremento del producto.',
    },
  },
  fr: {
    translation: {
      title: 'Chess AI',
      localeLabel: 'Langue',
      applyLanguage: 'Appliquer la langue',
      themeLabel: 'Thème',
      currentTheme: 'Étude',
      themeComingSoon: 'Le choix de thème arrive bientôt',
      eyebrow: 'Un espace pour jouer et apprendre',
      heroTitle: 'Jouez votre prochain coup ensemble.',
      heroDescription:
        'Lancez une partie amicale en ligne, explorez les tables ouvertes et développez votre pratique des échecs à votre rythme.',
      createGame: 'Créer une partie',
      browseGames: 'Voir les parties ouvertes',
      learningTitle: 'Apprendre à chaque partie',
      learningDescription:
        'Des cours, exercices guidés et outils de coaching prennent forme autour de l’échiquier.',
      learningStatus: 'Espace d’apprentissage · bientôt disponible',
      boardLabel: 'Aperçu de l’échiquier',
      boardCaption: 'Un échiquier partagé, un coup réfléchi à la fois.',
      openTables: 'Tables ouvertes',
      openTablesDescription: 'Trouvez un autre joueur et commencez lorsque vous êtes prêt.',
      nameDialogTitle: 'Choisissez votre nom visible',
      nameDialogDescription:
        'Ce nom vous identifiera à la table. Il doit être unique dans Chess AI.',
      nameLabel: 'Nom visible',
      namePlaceholder: 'Par exemple, CavalierCalme',
      cancel: 'Annuler',
      createGameWithName: 'Créer une partie avec {{name}}',
      browseGamesWithName: 'Voir les parties avec {{name}}',
      nameRequired: 'Saisissez un nom visible pour continuer.',
      prototypeNotice:
        'Ceci est un prototype visuel. Les actions multijoueurs seront connectées dans la prochaine étape du produit.',
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
