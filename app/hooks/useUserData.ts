import { useState, useEffect, useCallback } from "react";

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

export function useUserData() {
  const [data, setData] = useState<StoredData>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadFromStorage());
    setLoaded(true);
  }, []);

  /** Update state and persist to localStorage atomically. */
  const update = useCallback((fn: (prev: StoredData) => StoredData) => {
    setData((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* storage full or unavailable */ }
      return next;
    });
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
    setData(DEFAULT);
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
