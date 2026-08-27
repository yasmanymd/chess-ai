import { useEffect, useState } from 'react';
import { Link, useLoaderData, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  getStudyProgress,
  onStudyProgressChange,
  resetStudyProgress,
} from '../study-progress.client.js';

type StudyExercise = {
  id: string;
  category: 'mate-in-one' | 'win-material' | 'find-the-best-move';
  solverColor: 'white' | 'black';
  copy: { title: string; prompt: string };
};

export async function loader({ request }: { request: Request }) {
  const language = new URL(request.url).searchParams.get('lang') ?? 'en';
  const response = await fetch(`http://server:3000/study/exercises?lang=${language}`);
  if (!response.ok) throw new Response('Study catalog unavailable', { status: response.status });
  return (await response.json()) as { exercises: StudyExercise[] };
}

export default function StudyCatalog() {
  const { t } = useTranslation();
  const { exercises } = useLoaderData<typeof loader>();
  const location = useLocation();
  const language = new URLSearchParams(location.search).get('lang');
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const updateProgress = () => setCompletedExerciseIds(getStudyProgress());
    updateProgress();
    return onStudyProgressChange(updateProgress);
  }, []);

  const completedCount = exercises.filter((exercise) =>
    completedExerciseIds.has(exercise.id),
  ).length;
  const resetProgress = () => {
    if (window.confirm(t('studyResetConfirmation'))) {
      resetStudyProgress();
    }
  };

  return (
    <main className="study-page" id="main-content">
      <p className="eyebrow">
        <span aria-hidden="true">✦</span> {t('studyEyebrow')}
      </p>
      <h1>{t('studyTitle')}</h1>
      <p className="page-description">{t('studyDescription')}</p>
      <div className="study-progress-summary">
        <p>{t('studyProgress', { completed: completedCount, total: exercises.length })}</p>
        {completedCount > 0 ? (
          <button className="text-link" onClick={resetProgress} type="button">
            {t('studyResetProgress')}
          </button>
        ) : null}
      </div>
      <section aria-label={t('studyCatalog')} className="study-catalog">
        {exercises.map((exercise) => (
          <article className="study-card" key={exercise.id}>
            <p className="card-kicker">
              {t(`studyCategory.${exercise.category}`)}
              {completedExerciseIds.has(exercise.id) ? (
                <span className="study-complete-badge">{t('studyCompleted')}</span>
              ) : null}
            </p>
            <h2>{exercise.copy.title}</h2>
            <p>{exercise.copy.prompt}</p>
            <p className="study-side">
              <i
                aria-hidden="true"
                className={`piece-color-indicator piece-color-${exercise.solverColor === 'white' ? 'light' : 'dark'}`}
              />
              {t(`studySide.${exercise.solverColor}`)}
            </p>
            <Link
              className="button button-primary"
              to={`/study/${exercise.id}?lang=${language ?? 'en'}`}
            >
              {t('studyOpenExercise')}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
