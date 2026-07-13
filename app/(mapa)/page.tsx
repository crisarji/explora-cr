import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import { provincias, totales } from "@/lib/divisiones";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-medium">Costa Rica</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Explora las divisiones territoriales del país. Haz clic en una
        provincia para acercarte.
      </p>
      <StatsCards
        stats={[
          { label: "Provincias", value: totales.provincias },
          { label: "Cantones", value: totales.cantones },
          { label: "Distritos", value: totales.distritos },
        ]}
      />
      <RegionList
        title="Provincias"
        items={provincias.map((p) => ({
          codigo: p.codigo,
          nombre: p.nombre,
          href: `/${p.slug}`,
        }))}
      />
    </section>
  );
}
