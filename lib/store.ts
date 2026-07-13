import { create } from "zustand";

/**
 * Ephemeral UI state only (PLAN.md architecture rule 2). The current
 * selection lives in the URL — never here.
 */
export interface HoveredRegion {
  nivel: "provincia" | "canton" | "distrito";
  codigo: string;
  nombre: string;
}

interface UIState {
  hovered: HoveredRegion | null;
  /** Tooltip position in px, relative to the map container. */
  tooltip: { x: number; y: number } | null;
  /** True while a zoom transition is in flight; hover is suppressed. */
  isAnimating: boolean;
  setHovered: (hovered: HoveredRegion | null) => void;
  setTooltip: (tooltip: { x: number; y: number } | null) => void;
  setAnimating: (isAnimating: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hovered: null,
  tooltip: null,
  isAnimating: false,
  setHovered: (hovered) => set({ hovered }),
  setTooltip: (tooltip) => set({ tooltip }),
  setAnimating: (isAnimating) => set({ isAnimating }),
}));
