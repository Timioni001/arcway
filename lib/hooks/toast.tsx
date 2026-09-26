'use client';

import { CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; text: string };
const Ctx = createContext<(text: string) => void>(() => {});

/** Small confirmation messages (e.g. "25 XP claimed"). Announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast"><CircleCheck aria-hidden="true" />{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
