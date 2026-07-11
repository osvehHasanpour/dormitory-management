import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void): () => void {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}

/** Bottom sheet on phones, centered modal on tablet, anchored panel on desktop */
export type PanelLayout = "sheet" | "modal" | "dropdown";

export function usePanelLayout(): PanelLayout {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return "dropdown";
  }

  if (isTablet) {
    return "modal";
  }

  return "sheet";
}

/** @deprecated Use usePanelLayout instead */
export function useIsMobilePanel(): boolean {
  return !useMediaQuery("(min-width: 1024px)");
}
