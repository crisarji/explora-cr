"use client";

import { useState } from "react";
import QuizMap from "./quiz-map";
import { provincias, type Canton } from "@/lib/divisiones";
import { useT } from "@/lib/i18n";

const TOTAL = 10;
const CHOICES = 4;

interface Option {
  codigo: string;
  nombre: string;
}

interface Round {
  provinciaCodigo: string;
  provinciaNombre: string;
  target: Option;
  choices: Option[];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const toOption = (c: Canton): Option => ({ codigo: c.codigo, nombre: c.nombre });

/**
 * Distractors come from the same province — harder, and it teaches which
 * cantons belong together.
 */
function makeRounds(): Round[] {
  const pool = provincias.flatMap((p) =>
    p.cantones.map((canton) => ({ provincia: p, canton }))
  );
  return shuffle(pool)
    .slice(0, TOTAL)
    .map(({ provincia, canton }) => {
      const distractors = shuffle(
        provincia.cantones.filter((c) => c.codigo !== canton.codigo)
      ).slice(0, CHOICES - 1);
      return {
        provinciaCodigo: provincia.codigo,
        provinciaNombre: provincia.nombre,
        target: toOption(canton),
        choices: shuffle([canton, ...distractors].map(toOption)),
      };
    });
}

export default function Quiz() {
  const t = useT();
  // Rounds are generated on user action only — never during render, so the
  // random content can't cause an SSR hydration mismatch.
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const start = () => {
    setRounds(makeRounds());
    setCurrent(0);
    setScore(0);
    setPicked(null);
  };

  // Start screen
  if (!rounds) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-neutral-500 dark:text-neutral-400">
          {t("juego.descripcion")}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 rounded-lg bg-neutral-900 px-6 py-2.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {t("juego.empezar")}
        </button>
      </div>
    );
  }

  // Results screen
  if (current >= rounds.length) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-4xl font-medium" aria-live="polite">
          {t("juego.resultado", { score, total: rounds.length })}
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-6 rounded-lg bg-neutral-900 px-6 py-2.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {t("juego.jugarDeNuevo")}
        </button>
      </div>
    );
  }

  const round = rounds[current];
  const answered = picked !== null;
  const isLast = current === rounds.length - 1;

  const pick = (codigo: string) => {
    if (answered) return;
    setPicked(codigo);
    if (codigo === round.target.codigo) setScore((s) => s + 1);
  };

  const next = () => {
    setPicked(null);
    setCurrent((c) => c + 1);
  };

  const choiceClass = (codigo: string) => {
    const base =
      "rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors";
    if (!answered) {
      return `${base} border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500 cursor-pointer`;
    }
    if (codigo === round.target.codigo) {
      return `${base} border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`;
    }
    if (codigo === picked) {
      return `${base} border-red-500 bg-red-500/10 text-red-700 dark:text-red-400`;
    }
    return `${base} border-neutral-200 opacity-50 dark:border-neutral-800`;
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <QuizMap
        provinciaCodigo={round.provinciaCodigo}
        targetCodigo={round.target.codigo}
      />
      <div>
        <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
          <span>
            {t("juego.ronda", { n: current + 1, total: rounds.length })}
          </span>
          <span>
            {t("juego.puntaje")}: {score}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-medium">
          {t("juego.pregunta", { provincia: round.provinciaNombre })}
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {round.choices.map((choice) => (
            <button
              key={choice.codigo}
              type="button"
              disabled={answered}
              onClick={() => pick(choice.codigo)}
              className={choiceClass(choice.codigo)}
            >
              {choice.nombre}
            </button>
          ))}
        </div>
        <div className="mt-4 min-h-6 text-sm" aria-live="polite">
          {answered &&
            (picked === round.target.codigo ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                {t("juego.correcto")}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                {t("juego.incorrecto", { nombre: round.target.nombre })}
              </span>
            ))}
        </div>
        {answered && (
          <button
            type="button"
            onClick={next}
            className="mt-2 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLast ? t("juego.verResultado") : t("juego.siguiente")}
          </button>
        )}
      </div>
    </div>
  );
}
