import StatsCards from "@/components/panel/StatsCards";
import RegionList from "@/components/panel/RegionList";
import T from "@/components/T";
import { provincias, totales } from "@/lib/divisiones";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-3xl font-medium">Costa Rica</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        <T k="home.intro" />
      </p>
      <StatsCards
        stats={[
          { labelKey: "stats.provincias", value: totales.provincias },
          { labelKey: "stats.cantones", value: totales.cantones },
          { labelKey: "stats.distritos", value: totales.distritos },
        ]}
      />
      <RegionList
        titleKey="list.provincias"
        items={provincias.map((p) => ({
          codigo: p.codigo,
          nombre: p.nombre,
          href: `/${p.slug}`,
        }))}
      />
    </section>
  );
}
