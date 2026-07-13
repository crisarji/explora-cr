import MapCanvas from "@/components/map/MapCanvas";

/**
 * Shared layout for all map views (country → province → canton). The map
 * mounts once here and persists across route changes, which is what lets
 * zoom transitions animate between views instead of remounting.
 */
export default function MapaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <MapCanvas />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
