"use client";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";

// Lets in-page forms expose actions (Save, Add line, …) that keyboard shortcuts
// can fire. A form registers a handler for an action id on mount and unregisters
// on unmount; the keydown handler calls run(id).
type Handler = () => void;

type Bus = {
  register: (action: string, fn: Handler) => () => void;
  run: (action: string) => boolean; // true if a handler was found
  has: (action: string) => boolean;
};

const ActionBusContext = createContext<Bus | null>(null);

export function ActionBusProvider({ children }: { children: ReactNode }) {
  const handlers = useRef<Map<string, Handler>>(new Map());

  const register = useCallback((action: string, fn: Handler) => {
    handlers.current.set(action, fn);
    return () => {
      if (handlers.current.get(action) === fn) handlers.current.delete(action);
    };
  }, []);

  const run = useCallback((action: string) => {
    const fn = handlers.current.get(action);
    if (fn) {
      fn();
      return true;
    }
    return false;
  }, []);

  const has = useCallback((action: string) => handlers.current.has(action), []);

  return (
    <ActionBusContext.Provider value={{ register, run, has }}>
      {children}
    </ActionBusContext.Provider>
  );
}

export function useActionBus(): Bus {
  const bus = useContext(ActionBusContext);
  if (!bus) throw new Error("useActionBus must be used within ActionBusProvider");
  return bus;
}

// Register a keyboard-driven action for the lifetime of a component.
// `fn` is read through a ref so callers can pass an inline closure without
// re-registering on every render.
export function useAction(action: string, fn: () => void) {
  const bus = useActionBus();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => bus.register(action, () => ref.current()), [bus, action]);
}
