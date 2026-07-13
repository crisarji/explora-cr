import type { Metadata } from "next";
import ZoomPrototype from "./prototype";

export const metadata: Metadata = {
  title: "Prototipo de zoom — Explora Costa Rica",
  robots: { index: false },
};

export default function PrototipoPage() {
  return (
    <section>
      <h1 className="text-2xl font-medium">Prototipo: zoom a provincia</h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Página de prueba (Fase 2) para de-riesgar la interacción de la Fase 3.
        Clic en una provincia acerca la cámara y revela sus cantones; clic en
        el fondo la aleja. No es parte del sitio final.
      </p>
      <div className="mt-6">
        <ZoomPrototype />
      </div>
    </section>
  );
}
