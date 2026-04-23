import {
  ArrowRight,
  Bus,
  Clock,
  Heart,
  MapPin,
  Repeat,
} from "lucide-react";
import { BusLine } from "@/data/lines";

interface Props {
  line: BusLine;
  pinned: boolean;
  onTogglePin: () => void;
  onMap: () => void;
}

export const LineCard = ({ line, pinned, onTogglePin, onMap }: Props) => {
  const isDDD = line.type === "DDD";

  return (
    <article className="group rounded-3xl border border-white/40 bg-white/80 p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        {/* Numéro */}
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white shadow-md ${
            isDDD ? "bg-blue-600" : "bg-green-600"
          }`}
        >
          {line.number}
        </div>

        {/* Infos principales */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Ligne
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {line.type}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  {line.stops.length} arrêts
                </span>
              </div>
            </div>

            <button
              onClick={onTogglePin}
              aria-label={pinned ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`grid h-10 w-10 place-items-center rounded-full transition ${
                pinned
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-500 hover:text-gray-800"
              }`}
            >
              <Heart
                className="h-4 w-4"
                fill={pinned ? "currentColor" : "none"}
                strokeWidth={2.2}
              />
            </button>
          </div>

          {/* Départ → Arrivée */}
          <div className="mt-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="my-1 h-6 w-[2px] bg-gray-300" />
                <span className="h-3 w-3 rounded-full bg-red-500" />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{line.from}</p>
                <p className="mt-4 font-semibold text-gray-900">{line.to}</p>
              </div>
            </div>
          </div>

          {/* Infos secondaires */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {line.duration}
            </span>
            <span className="inline-flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" />
              {line.frequency}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bus className="h-3.5 w-3.5" />
              {line.price} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Aperçu arrêts */}
      <div className="mt-4 border-t border-gray-200 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Itinéraire détaillé
        </p>

        <div className="space-y-2">
          {line.stops.slice(0, 5).map((stop, index) => (
            <div key={stop} className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span
                  className={`h-3 w-3 rounded-full ${
                    index === 0
                      ? "bg-emerald-500"
                      : index === line.stops.length - 1
                      ? "bg-red-500"
                      : "border-2 border-blue-500 bg-white"
                  }`}
                />
                {index < Math.min(line.stops.slice(0, 5).length - 1, 4) && (
                  <span className="mt-1 h-5 w-[2px] bg-gray-300" />
                )}
              </div>

              <span className="text-sm font-medium text-gray-800">{stop}</span>
            </div>
          ))}

          {line.stops.length > 5 && (
            <p className="pl-6 text-xs font-medium text-gray-500">
              +{line.stops.length - 5} autres arrêts
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onMap}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <MapPin className="h-4 w-4" />
          Voir sur la carte
        </button>

        <button
          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};