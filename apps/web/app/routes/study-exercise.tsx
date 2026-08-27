import { useEffect, useState } from 'react';
import { Link, useFetcher, useLoaderData, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { completeStudyExercise } from '../study-progress.client.js';

type PieceColor = 'white' | 'black';
type StudyExercise = {
  id: string;
  category: 'mate-in-one' | 'win-material' | 'find-the-best-move';
  fen: string;
  solverColor: PieceColor;
  copy: { title: string; prompt: string };
};
type AttemptResult =
  | { accepted: true; correct: true; feedback: { explanation: string } }
  | { accepted: true; correct: false; feedback: { hint: string } }
  | { accepted: false; errorCode: string };

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieceAsset: Record<string, string> = {
  P: '/pieces/cburnett/wP.svg',
  N: '/pieces/cburnett/wN.svg',
  B: '/pieces/cburnett/wB.svg',
  R: '/pieces/cburnett/wR.svg',
  Q: '/pieces/cburnett/wQ.svg',
  K: '/pieces/cburnett/wK.svg',
  p: '/pieces/cburnett/bP.svg',
  n: '/pieces/cburnett/bN.svg',
  b: '/pieces/cburnett/bB.svg',
  r: '/pieces/cburnett/bR.svg',
  q: '/pieces/cburnett/bQ.svg',
  k: '/pieces/cburnett/bK.svg',
};

function piecesFromFen(fen: string): Record<string, string> {
  const pieces: Record<string, string> = {};
  fen
    .split(' ')[0]
    .split('/')
    .forEach((rank, rankIndex) => {
      let fileIndex = 0;
      for (const token of rank) {
        if (/\d/.test(token)) fileIndex += Number(token);
        else {
          pieces[`${files[fileIndex]}${8 - rankIndex}`] = token;
          fileIndex += 1;
        }
      }
    });
  return pieces;
}

function belongsToSolver(piece: string | undefined, color: PieceColor): boolean {
  return (
    Boolean(piece) &&
    (color === 'white' ? piece === piece!.toUpperCase() : piece === piece!.toLowerCase())
  );
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { exerciseId?: string };
}) {
  const language = new URL(request.url).searchParams.get('lang') ?? 'en';
  const response = await fetch(
    `http://server:3000/study/exercises/${params.exerciseId ?? ''}?lang=${language}`,
  );
  if (response.status === 404) throw new Response('Study exercise not found', { status: 404 });
  if (!response.ok) throw new Response('Study exercise unavailable', { status: response.status });
  return (await response.json()) as { exercise: StudyExercise };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { exerciseId?: string };
}) {
  const form = await request.formData();
  const language = new URL(request.url).searchParams.get('lang') ?? 'en';
  const response = await fetch(
    `http://server:3000/study/exercises/${params.exerciseId ?? ''}/attempts?lang=${language}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ from: form.get('from'), to: form.get('to') }),
    },
  );
  if (response.ok) return (await response.json()) as AttemptResult;
  const payload = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
  return {
    accepted: false,
    errorCode: payload?.error?.code ?? 'STUDY_MOVE_INVALID',
  } as AttemptResult;
}

export default function StudyExerciseRoute() {
  const { t } = useTranslation();
  const { exercise } = useLoaderData<typeof loader>();
  const attemptFetcher = useFetcher<typeof action>();
  const [selected, setSelected] = useState<string>();
  const location = useLocation();
  const pieces = piecesFromFen(exercise.fen);
  const whiteSquares = Array.from(
    { length: 64 },
    (_, index) => `${files[index % 8]}${8 - Math.floor(index / 8)}`,
  );
  const squares = exercise.solverColor === 'white' ? whiteSquares : whiteSquares.reverse();
  const language = new URLSearchParams(location.search).get('lang');
  const response = attemptFetcher.data;

  useEffect(() => {
    if (response?.accepted && response.correct) {
      completeStudyExercise(exercise.id);
    }
  }, [exercise.id, response]);

  const chooseSquare = (square: string) => {
    const piece = pieces[square];
    if (!selected && belongsToSolver(piece, exercise.solverColor)) {
      setSelected(square);
      return;
    }
    if (selected) {
      attemptFetcher.submit({ from: selected, to: square }, { method: 'post' });
      setSelected(undefined);
    }
  };

  return (
    <main className="study-page" id="main-content">
      <Link className="text-link" to={`/study?lang=${language ?? 'en'}`}>
        ← {t('studyBack')}
      </Link>
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t(`studyCategory.${exercise.category}`)}
      </p>
      <h1>{exercise.copy.title}</h1>
      <p className="page-description">{exercise.copy.prompt}</p>
      <section className="study-layout" aria-label={t('studyBoardLabel')}>
        <div className="game-board-panel">
          <div className="match-board interactive-board study-board" role="group">
            {squares.map((square, index) => {
              const piece = pieces[square];
              const firstFile = index % 8 === 0;
              const lastRank = Math.floor(index / 8) === 7;
              const className = `square ${(Math.floor(index / 8) + (index % 8)) % 2 === 0 ? 'square-light' : 'square-dark'}${selected === square ? ' square-selected' : ''}`;
              return (
                <button
                  aria-label={selected ? `${selected} to ${square}` : `Select ${square}`}
                  className={className}
                  key={square}
                  onClick={() => chooseSquare(square)}
                  type="button"
                >
                  {piece ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="chess-piece"
                      src={pieceAsset[piece]}
                    />
                  ) : null}
                  {firstFile ? (
                    <span aria-hidden="true" className="board-coordinate board-rank">
                      {square[1]}
                    </span>
                  ) : null}
                  {lastRank ? (
                    <span aria-hidden="true" className="board-coordinate board-file">
                      {square[0]}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        <aside className="study-feedback">
          <p className="study-side">
            <i
              aria-hidden="true"
              className={`piece-color-indicator piece-color-${exercise.solverColor === 'white' ? 'light' : 'dark'}`}
            />
            {t(`studySide.${exercise.solverColor}`)}
          </p>
          <p>{selected ? t('studyChooseDestination') : t('studyChoosePiece')}</p>
          {attemptFetcher.state !== 'idle' ? <p role="status">{t('studyChecking')}</p> : null}
          {response?.accepted && response.correct ? (
            <div className="study-outcome study-success" role="status">
              <h2>{t('studyCorrect')}</h2>
              <p>{response.feedback.explanation}</p>
              <Link className="button button-primary" to={`/study?lang=${language ?? 'en'}`}>
                {t('studyNextExercise')}
              </Link>
            </div>
          ) : null}
          {response?.accepted && !response.correct ? (
            <div className="study-outcome study-hint" role="status">
              <h2>{t('studyTryAgain')}</h2>
              <p>{response.feedback.hint}</p>
            </div>
          ) : null}
          {response && !response.accepted ? (
            <p className="field-error" role="alert">
              {t('studyInvalidMove')}
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
