import type { ChessColor, ChessMoveIntent } from '../../game/domain/chess-rules-port.js';

export const supportedStudyLocales = ['en', 'es', 'fr'] as const;

export type StudyLocale = (typeof supportedStudyLocales)[number];

export type StudyCategory = 'mate-in-one' | 'win-material' | 'find-the-best-move';

export type StudyCopy = {
  title: string;
  prompt: string;
  hint: string;
  explanation: string;
};

export type StudyExercise = {
  id: string;
  category: StudyCategory;
  fen: string;
  solverColor: ChessColor;
  solution: ChessMoveIntent;
  copy: Record<StudyLocale, StudyCopy>;
};

export type PublicStudyExercise = Omit<StudyExercise, 'solution' | 'copy'> & {
  copy: Pick<StudyCopy, 'title' | 'prompt'>;
};

const exerciseCopy = (
  title: string,
  prompt: string,
  hint: string,
  explanation: string,
): StudyCopy => ({ title, prompt, hint, explanation });

/**
 * A deliberately small, editorial, version-controlled catalog. Solutions are
 * kept server-side and omitted from public catalog responses.
 */
export const studyExercises: readonly StudyExercise[] = [
  {
    id: 'mate-in-one-white-queen',
    category: 'mate-in-one',
    fen: '6k1/5Q2/6K1/8/8/8/8/8 w - - 0 1',
    solverColor: 'white',
    solution: { from: 'f7', to: 'g7' },
    copy: {
      en: exerciseCopy(
        'Queen to g7',
        'White to move. Find mate in one.',
        'Bring the queen next to the king with support from your king.',
        'Qg7# is mate: the queen is protected by the king on g6 and takes away every escape square.',
      ),
      es: exerciseCopy(
        'La dama a g7',
        'Juegan blancas. Encuentra mate en una.',
        'Acerca la dama al rey con el apoyo de tu rey.',
        'Qg7# es mate: el rey de g6 protege a la dama y no deja ninguna casilla de escape.',
      ),
      fr: exerciseCopy(
        'La dame en g7',
        'Aux blancs de jouer. Trouvez le mat en un coup.',
        'Approchez la dame du roi avec le soutien de votre roi.',
        'Qg7# est mat : le roi en g6 protège la dame et retire toutes les cases de fuite.',
      ),
    },
  },
  {
    id: 'mate-in-one-black-queen',
    category: 'mate-in-one',
    fen: '6K1/5q2/6k1/8/8/8/8/8 b - - 0 1',
    solverColor: 'black',
    solution: { from: 'f7', to: 'g7' },
    copy: {
      en: exerciseCopy(
        'Queen to g7',
        'Black to move. Find mate in one.',
        'Use the queen beside the king and let your king provide protection.',
        'Qg7# is mate: the queen is protected by the king on g6 and closes every escape square.',
      ),
      es: exerciseCopy(
        'La dama a g7',
        'Juegan negras. Encuentra mate en una.',
        'Coloca la dama junto al rey y deja que tu rey la proteja.',
        'Qg7# es mate: el rey de g6 protege a la dama y cierra todas las casillas de escape.',
      ),
      fr: exerciseCopy(
        'La dame en g7',
        'Aux noirs de jouer. Trouvez le mat en un coup.',
        'Placez la dame près du roi et laissez votre roi la protéger.',
        'Qg7# est mat : le roi en g6 protège la dame et ferme toutes les cases de fuite.',
      ),
    },
  },
  {
    id: 'win-material-white-queen',
    category: 'win-material',
    fen: '4k3/8/8/8/8/8/4q3/4KQ2 w - - 0 1',
    solverColor: 'white',
    solution: { from: 'f1', to: 'e2' },
    copy: {
      en: exerciseCopy(
        'Take the hanging queen',
        'White to move. Win material.',
        'Look for the most valuable undefended piece.',
        'Qxe2 wins Black’s queen. Always check whether a direct capture is legal before looking for a more complicated tactic.',
      ),
      es: exerciseCopy(
        'Captura la dama colgada',
        'Juegan blancas. Gana material.',
        'Busca la pieza sin defensa de mayor valor.',
        'Qxe2 gana la dama negra. Antes de buscar una táctica complicada, comprueba si una captura directa es legal.',
      ),
      fr: exerciseCopy(
        'Prenez la dame en prise',
        'Aux blancs de jouer. Gagnez du matériel.',
        'Cherchez la pièce non défendue qui a le plus de valeur.',
        'Qxe2 gagne la dame noire. Avant de chercher une tactique complexe, vérifiez si une prise directe est légale.',
      ),
    },
  },
  {
    id: 'win-material-black-queen',
    category: 'win-material',
    fen: '4kq2/4Q3/8/8/8/8/8/4K3 b - - 0 1',
    solverColor: 'black',
    solution: { from: 'f8', to: 'e7' },
    copy: {
      en: exerciseCopy(
        'Take the checking queen',
        'Black to move. Win material.',
        'Your king is in check. Can you answer by taking the attacker?',
        'Qxe7 removes the checking queen and wins the material at once.',
      ),
      es: exerciseCopy(
        'Captura la dama que da jaque',
        'Juegan negras. Gana material.',
        'Tu rey está en jaque. ¿Puedes responder capturando la atacante?',
        'Qxe7 elimina la dama que da jaque y gana el material inmediatamente.',
      ),
      fr: exerciseCopy(
        'Prenez la dame qui donne échec',
        'Aux noirs de jouer. Gagnez du matériel.',
        'Votre roi est en échec. Pouvez-vous répondre en prenant l’attaquante ?',
        'Qxe7 retire la dame qui donne échec et gagne immédiatement le matériel.',
      ),
    },
  },
  {
    id: 'best-move-white-development',
    category: 'find-the-best-move',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2',
    solverColor: 'white',
    solution: { from: 'f1', to: 'c4' },
    copy: {
      en: exerciseCopy(
        'Develop with purpose',
        'White to move. Find the best move.',
        'Develop a piece toward the center while pointing at a sensitive square.',
        'Bc4 develops the bishop, targets f7, and prepares natural kingside castling.',
      ),
      es: exerciseCopy(
        'Desarrolla con intención',
        'Juegan blancas. Encuentra la mejor jugada.',
        'Desarrolla una pieza hacia el centro y apunta a una casilla sensible.',
        'Bc4 desarrolla el alfil, apunta a f7 y prepara el enroque corto natural.',
      ),
      fr: exerciseCopy(
        'Développez avec une idée',
        'Aux blancs de jouer. Trouvez le meilleur coup.',
        'Développez une pièce vers le centre en visant une case sensible.',
        'Bc4 développe le fou, vise f7 et prépare le petit roque naturel.',
      ),
    },
  },
  {
    id: 'best-move-black-development',
    category: 'find-the-best-move',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    solverColor: 'black',
    solution: { from: 'g8', to: 'f6' },
    copy: {
      en: exerciseCopy(
        'Challenge the center',
        'Black to move. Find the best move.',
        'Develop a knight and increase pressure on the center.',
        'Nf6 develops a piece, attacks e4, and prepares Black to castle.',
      ),
      es: exerciseCopy(
        'Desafía el centro',
        'Juegan negras. Encuentra la mejor jugada.',
        'Desarrolla un caballo y aumenta la presión sobre el centro.',
        'Nf6 desarrolla una pieza, ataca e4 y prepara el enroque de las negras.',
      ),
      fr: exerciseCopy(
        'Contestez le centre',
        'Aux noirs de jouer. Trouvez le meilleur coup.',
        'Développez un cavalier et augmentez la pression sur le centre.',
        'Nf6 développe une pièce, attaque e4 et prépare le roque des noirs.',
      ),
    },
  },
];

export function getStudyExercise(exerciseId: string): StudyExercise | undefined {
  return studyExercises.find((exercise) => exercise.id === exerciseId);
}

export function publicStudyExercise(
  exercise: StudyExercise,
  locale: StudyLocale,
): PublicStudyExercise {
  return {
    id: exercise.id,
    category: exercise.category,
    fen: exercise.fen,
    solverColor: exercise.solverColor,
    copy: {
      title: exercise.copy[locale].title,
      prompt: exercise.copy[locale].prompt,
    },
  };
}
