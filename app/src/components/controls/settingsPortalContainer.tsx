import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * When settings are shown inside a modal layer (e.g. Vaul drawer on mobile),
 * floating menus must portal into that layer. Otherwise Radix Dialog blocks
 * pointer events to body-portaled content and touches fall through.
 */
const SettingsPortalContainerContext =
  createContext<RefObject<HTMLElement | null> | null>(null);

export function SettingsPortalContainerProvider({
  containerRef,
  children,
}: {
  containerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <SettingsPortalContainerContext.Provider value={containerRef}>
      {children}
    </SettingsPortalContainerContext.Provider>
  );
}

export function useSettingsPortalContainer() {
  return useContext(SettingsPortalContainerContext);
}
