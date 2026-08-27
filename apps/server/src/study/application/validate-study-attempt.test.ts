import { describe, expect, it } from 'vitest';
import { ChessJsRulesAdapter } from '../../game/infrastructure/chess-js-rules-adapter.js';
import { studyExercises } from '../domain/study-exercise.js';
import { validateStudyAttempt } from './validate-study-attempt.js';

const rules = new ChessJsRulesAdapter();

describe('validateStudyAttempt', () => {
  it('accepts every editorial solution as a legal move', () => {
    for (const exercise of studyExercises) {
      const result = validateStudyAttempt(rules, exercise.id, exercise.solution, 'en');
      expect(result).toMatchObject({ accepted: true, correct: true });
    }
  });

  it('returns a hint for a legal move that is not the accepted solution', () => {
    const result = validateStudyAttempt(
      rules,
      'best-move-white-development',
      { from: 'b1', to: 'c3' },
      'es',
    );

    expect(result).toEqual({
      accepted: true,
      correct: false,
      feedback: { hint: 'Desarrolla una pieza hacia el centro y apunta a una casilla sensible.' },
    });
  });

  it('rejects illegal moves and unknown exercises without accepting progress', () => {
    expect(
      validateStudyAttempt(rules, 'mate-in-one-white-queen', { from: 'g6', to: 'g7' }, 'en'),
    ).toEqual({ accepted: false, code: 'STUDY_MOVE_INVALID' });
    expect(validateStudyAttempt(rules, 'unknown', { from: 'f7', to: 'g7' }, 'en')).toEqual({
      accepted: false,
      code: 'STUDY_EXERCISE_NOT_FOUND',
    });
  });
});
