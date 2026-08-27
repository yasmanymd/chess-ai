const progressStorageKey = 'chess-ai.study-progress.v1';
const progressChangedEvent = 'chess-ai:study-progress-changed';

function readStoredProgress(): string[] {
  try {
    const stored = window.localStorage.getItem(progressStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

export function getStudyProgress(): Set<string> {
  return new Set(readStoredProgress());
}

export function completeStudyExercise(exerciseId: string): void {
  const progress = getStudyProgress();
  progress.add(exerciseId);
  window.localStorage.setItem(progressStorageKey, JSON.stringify([...progress]));
  window.dispatchEvent(new Event(progressChangedEvent));
}

export function resetStudyProgress(): void {
  window.localStorage.removeItem(progressStorageKey);
  window.dispatchEvent(new Event(progressChangedEvent));
}

export function onStudyProgressChange(listener: () => void): () => void {
  window.addEventListener(progressChangedEvent, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(progressChangedEvent, listener);
    window.removeEventListener('storage', listener);
  };
}
