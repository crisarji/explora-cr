"use client";

import { useUIStore } from "@/lib/store";

/** Region-name tooltip that follows the cursor inside the map container. */
export default function HoverTooltip() {
  const hovered = useUIStore((s) => s.hovered);
  const tooltip = useUIStore((s) => s.tooltip);

  if (!hovered || !tooltip) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 rounded-md bg-tinta/90 px-2.5 py-1 text-xs font-medium text-lienzo shadow-sm"
      style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
    >
      {hovered.nombre}
    </div>
  );
}
