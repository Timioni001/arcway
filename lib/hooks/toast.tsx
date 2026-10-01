'use client';

import { CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; text: string; leaving?: boolean };
const Ctx = createContext<(text: string) => void>(() => {});

/** Small confirmation messages (e.g. "25 XP claimed"). Announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 220);
  }, []);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} type="button" className="toast" data-leaving={t.leaving || undefined} onClick={() => dismiss(t.id)} aria-label={`${t.text}. Dismiss`}>
            <CircleCheck aria-hidden="true" />{t.text}
          </button>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
