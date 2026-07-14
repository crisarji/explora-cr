import type { Metadata } from "next";
import Quiz from "./quiz";
import T from "@/components/T";

export const metadata: Metadata = {
  title: "¿Cuál es este cantón?",
  description:
    "Juego educativo: adivina el cantón resaltado en el mapa de Costa Rica. 10 rondas, 4 opciones.",
  alternates: { canonical: "/juego" },
};

export default function JuegoPage() {
  return (
    <section>
      <h1 className="text-3xl font-medium">
        <T k="juego.titulo" />
      </h1>
      <div className="mt-8">
        <Quiz />
      </div>
    </section>
  );
}
