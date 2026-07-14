import type { Metadata } from "next";
import T from "@/components/T";

export const metadata: Metadata = {
  title: "Acerca",
  description:
    "Acerca de Explora Costa Rica: proyecto gratuito de servicio social con datos abiertos del Instituto Geográfico Nacional.",
  alternates: { canonical: "/acerca" },
};

export default function AcercaPage() {
  return (
    <section className="prose max-w-none">
      <h1 className="text-3xl font-medium">
        <T k="acerca.titulo" />
      </h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        <T k="acerca.p1" />
      </p>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        <T k="acerca.p2" />
      </p>
    </section>
  );
}
