import type { ChessMoveIntent, ChessRulesPort } from '../../game/domain/chess-rules-port.js';
import { getStudyExercise, type StudyLocale, type StudyCopy } from '../domain/study-exercise.js';

export type StudyAttemptResult =
  | { accepted: false; code: 'STUDY_EXERCISE_NOT_FOUND' }
  | { accepted: false; code: 'STUDY_MOVE_INVALID' }
  | {
      accepted: true;
      correct: false;
      feedback: Pick<StudyCopy, 'hint'>;
    }
  | {
      accepted: true;
      correct: true;
      feedback: Pick<StudyCopy, 'explanation'>;
    };

function isSameMove(expected: ChessMoveIntent, actual: ChessMoveIntent): boolean {
  return (
    expected.from === actual.from &&
    expected.to === actual.to &&
    (expected.promotion ?? undefined) === (actual.promotion ?? undefined)
  );
}

/**
 * Checks a learner attempt against editorial server-owned study data. The
 * rules port proves the submitted move is legal before the exercise solution
 * policy decides whether it is the accepted answer.
 */
export function validateStudyAttempt(
  rules: ChessRulesPort,
  exerciseId: string,
  move: ChessMoveIntent,
  locale: StudyLocale,
): StudyAttemptResult {
  const exercise = getStudyExercise(exerciseId);
  if (!exercise) return { accepted: false, code: 'STUDY_EXERCISE_NOT_FOUND' };

  const attemptedMove = rules.tryMove(exercise.fen, move);
  if (!attemptedMove.accepted) return { accepted: false, code: 'STUDY_MOVE_INVALID' };

  if (!isSameMove(exercise.solution, move)) {
    return { accepted: true, correct: false, feedback: { hint: exercise.copy[locale].hint } };
  }

  return {
    accepted: true,
    correct: true,
    feedback: { explanation: exercise.copy[locale].explanation },
  };
}
