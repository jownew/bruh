import { useCallback, useSyncExternalStore } from "react";

export interface QuizAttempt {
  id: string;
  questionSet: string;
  score: number;
  total: number;
  date: string; // ISO 8601
}

interface StoredData {
  name: string;
  history: QuizAttempt[];
}

const STORAGE_KEY = "bruh_user_data";
const DEFAULT: StoredData = { name: "", history: [] };

function loadFromStorage(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredData) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

// Module-level cache so the store can be read synchronously by
// useSyncExternalStore without touching localStorage during SSR.
let cache: StoredData | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): StoredData {
  if (cache === null) cache = loadFromStorage();
  return cache;
}

function getServerSnapshot(): StoredData {
  return DEFAULT;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function setStore(next: StoredData) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* storage full or unavailable */ }
  listeners.forEach((listener) => listener());
}

// Mirrors whether we've hydrated on the client yet, so callers can
// avoid rendering client-only data until it's safe to do so.
const noopSubscribe = () => () => {};
function useHasHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useUserData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const loaded = useHasHydrated();

  /** Update state and persist to localStorage atomically. */
  const update = useCallback((fn: (prev: StoredData) => StoredData) => {
    setStore(fn(getSnapshot()));
  }, []);

  const setName = useCallback(
    (name: string) => update((d) => ({ ...d, name: name.trim() })),
    [update],
  );

  const saveAttempt = useCallback(
    (questionSet: string, score: number, total: number) =>
      update((d) => ({
        ...d,
        history: [
          {
            id: String(Date.now()),
            questionSet,
            score,
            total,
            date: new Date().toISOString(),
          },
          ...d.history,
        ].slice(0, 50), // cap at 50 entries
      })),
    [update],
  );

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setStore(DEFAULT);
  }, []);

  return {
    name: data.name,
    history: data.history,
    loaded,
    setName,
    saveAttempt,
    clearData,
  };
}
