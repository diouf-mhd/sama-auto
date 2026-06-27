import { ArrowLeft } from "lucide-react";

interface Props {
  line: any;
  onBack: () => void;
}

export const LineDetail = ({ line, onBack }: Props) => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>

        <h1 className="font-bold text-blue-600 text-lg">
          Ligne {line.number}
        </h1>

        <div className="w-6"></div>
      </div>

      {/* INFO CARD */}
      <div className="bg-white m-4 p-5 rounded-2xl shadow-sm">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg">
              {line.number}
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase">Ligne</p>
              <p className="font-bold text-lg">{line.type}</p>
            </div>
          </div>

          <div className="bg-gray-100 px-3 py-1 rounded-full text-xs">
            {line.stops?.length || 0} arrêts
          </div>
        </div>

        {/* Départ / Arrivée */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="font-semibold">{line.from_stop}</p>
          </div>

          <div className="h-6 w-[2px] bg-gray-300 ml-1.5"></div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="font-semibold">{line.to_stop}</p>
          </div>
        </div>
      </div>

      {/* ✅ ITINÉRAIRE DÉTAILLÉ */}
      <div className="px-6 pb-16">
        <h2 className="font-bold mb-6 text-gray-800">
          Itinéraire détaillé
        </h2>

        <div className="relative pl-6">
          {line.stops?.map((stop: string, index: number) => (
            <div key={index} className="mb-8 relative">

              {/* Ligne verticale */}
              {index !== line.stops.length - 1 && (
                <div className="absolute left-1.5 top-3 w-[2px] h-full bg-gray-300"></div>
              )}

              {/* Point */}
              <div
                className={`absolute left-0 w-3 h-3 rounded-full ${
                  index === 0
                    ? "bg-green-500"
                    : index === line.stops.length - 1
                    ? "bg-red-500"
                    : "border-2 border-blue-500 bg-white"
                }`}
              ></div>

              {/* Texte */}
              <div className="ml-4">
                <p className="font-medium text-gray-800">
                  {stop}
                </p>

                {index === 0 && (
                  <p className="text-xs text-gray-500">
                    Point de départ
                  </p>
                )}

                {index === line.stops.length - 1 && (
                  <p className="text-xs text-gray-500">
                    Destination finale
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};