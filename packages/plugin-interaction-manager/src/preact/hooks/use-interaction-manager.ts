import { useCapability, usePlugin } from '@embedpdf/core/preact';
import {
  initialState,
  InteractionManagerPlugin,
  InteractionManagerState,
  PointerEventHandlers,
} from '@embedpdf/plugin-interaction-manager';
import { useState, useEffect } from 'preact/hooks';

export const useInteractionManagerPlugin = () =>
  usePlugin<InteractionManagerPlugin>(InteractionManagerPlugin.id);
export const useInteractionManagerCapability = () =>
  useCapability<InteractionManagerPlugin>(InteractionManagerPlugin.id);

export function useInteractionManager() {
  const { provides } = useInteractionManagerCapability();
  const [state, setState] = useState<InteractionManagerState>(initialState);

  useEffect(() => {
    if (!provides) return;
    return provides.onStateChange((state) => {
      setState(state);
    });
  }, [provides]);

  return {
    provides,
    state,
  };
}

export function useCursor() {
  const { provides } = useInteractionManagerCapability();
  return {
    setCursor: (token: string, cursor: string, prio = 0) => {
      provides?.setCursor(token, cursor, prio);
    },
    removeCursor: (token: string) => {
      provides?.removeCursor(token);
    },
  };
}

interface UsePointerHandlersOptions {
  modeId?: string;
  pageIndex?: number;
}

export function usePointerHandlers({ modeId, pageIndex }: UsePointerHandlersOptions) {
  const { provides } = useInteractionManagerCapability();
  return {
    register: modeId
      ? (handlers: PointerEventHandlers) =>
          provides?.registerHandlers({ modeId, handlers, pageIndex })
      : (handlers: PointerEventHandlers) =>
          provides?.registerAlways({
            scope: pageIndex !== undefined ? { type: 'page', pageIndex } : { type: 'global' },
            handlers,
          }),
  };
}

export function useIsPageExclusive() {
  const { provides: cap } = useInteractionManagerCapability();

  const [isPageExclusive, setIsPageExclusive] = useState<boolean>(() => {
    const m = cap?.getActiveInteractionMode();
    return m?.scope === 'page' && !!m.exclusive;
  });

  useEffect(() => {
    if (!cap) return;

    return cap.onModeChange(() => {
      const mode = cap.getActiveInteractionMode();
      setIsPageExclusive(mode?.scope === 'page' && !!mode?.exclusive);
    });
  }, [cap]);

  return isPageExclusive;
}
