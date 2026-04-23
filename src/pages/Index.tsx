import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bus, ChevronRight, MapPin, Navigation, Search, ArrowRight, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineDetail } from "@/components/LineDetail";

type BusType = "DDD" | "TATA";

interface BusLine {
  id: string;
  number: string;
  type: BusType;
  from_stop: string;
  to_stop: string;
  stops: string[];
}

const Index = () => {
  const [lines, setLines] = useState<BusLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [selectedType, setSelectedType] = useState<BusType | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour la recherche trajet
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");

  useEffect(() => {
    const fetchLines = async () => {
      const { data } = await supabase
        .from("bus_lines")
        .select("*")
        .order("number", { ascending: true });

      if (data) {
        const formatted: BusLine[] = data.map((l) => ({
          id: l.id,
          number: l.number,
          type: l.type as BusType,
          from_stop: l.from_stop,
          to_stop: l.to_stop,
          stops: l.stops ?? [],
        }));
        setLines(formatted);
      }
      setLoading(false);
    };
    fetchLines();
  }, []);

  // Statistiques dynamiques
  const stats = useMemo(() => ({
    ddd: lines.filter(l => l.type === "DDD").length,
    tata: lines.filter(l => l.type === "TATA").length
  }), [lines]);

  // Filtrage intelligent (Trajet) ou Manuel (Boutons)
  const filteredLines = useMemo(() => {
    const start = startPoint.trim().toLowerCase();
    const end = endPoint.trim().toLowerCase();

    return lines.filter((l) => {
      const matchType = selectedType ? l.type === selectedType : true;
      const allStopsStr = l.stops.join(" ").toLowerCase();
      const matchStart = start ? allStopsStr.includes(start) : true;
      const matchEnd = end ? allStopsStr.includes(end) : true;
      return matchType && matchStart && matchEnd;
    });
  }, [startPoint, endPoint, selectedType, lines]);

  if (selectedLine) return <LineDetail line={selectedLine} onBack={() => setSelectedLine(null)} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans max-w-md mx-auto shadow-2xl">
      
      {/* HEADER BRT SÉNÉGAL STYLE */}
      <header className="bg-[#FFCC00] pt-6 pb-4 px-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Bus className="text-[#FFCC00] h-5 w-5" />
            </div>
            <h1 className="text-black text-lg font-black tracking-tighter uppercase">Sama Transit</h1>
          </div>
          <div className="flex items-center gap-1 bg-green-600 px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] text-white font-bold uppercase">Dakar</span>
          </div>
        </div>

        {/* DOUBLE BARRE DE RECHERCHE INTEGRÉE */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-black/5 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 p-2 border-b border-slate-100">
              <Navigation className="text-green-600 h-4 w-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Point de départ..." 
                className="bg-transparent w-full outline-none text-sm font-medium text-slate-700"
                value={startPoint}
                onChange={(e) => {setStartPoint(e.target.value); setSelectedType(null);}}
              />
            </div>
            <div className="flex items-center gap-3 p-2">
              <MapPin className="text-red-500 h-4 w-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Destination..." 
                className="bg-transparent w-full outline-none text-sm font-medium text-slate-700"
                value={endPoint}
                onChange={(e) => {setEndPoint(e.target.value); setSelectedType(null);}}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 overflow-y-auto">
        
        {/* BOUTONS DE RÉSEAU (COMPACTS) */}
        {!startPoint && !endPoint && (
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => setSelectedType(selectedType === "DDD" ? null : "DDD")}
              className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedType === "DDD" ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="text-left">
                <p className="text-[9px] font-bold text-blue-600 uppercase">DDD</p>
                <p className="text-sm font-black text-slate-800">{stats.ddd} Lignes</p>
              </div>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${selectedType === "DDD" ? 'bg-blue-600' : 'bg-slate-200'}`}>
                <ArrowRight size={14} />
              </div>
            </button>

            <button 
              onClick={() => setSelectedType(selectedType === "TATA" ? null : "TATA")}
              className={`flex-1 flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedType === "TATA" ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="text-left">
                <p className="text-[9px] font-bold text-green-600 uppercase">TATA</p>
                <p className="text-sm font-black text-slate-800">{stats.tata} Lignes</p>
              </div>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${selectedType === "TATA" ? 'bg-green-600' : 'bg-slate-200'}`}>
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        )}

        {/* LISTE DES RÉSULTATS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest">
              {startPoint || endPoint || selectedType ? `Résultats (${filteredLines.length})` : "Toutes les lignes"}
            </h3>
            {(startPoint || endPoint || selectedType) && (
              <button onClick={() => {setStartPoint(""); setEndPoint(""); setSelectedType(null);}} className="text-[10px] font-black text-red-500 uppercase">Reset</button>
            )}
          </div>

          {filteredLines.length > 0 ? (
            filteredLines.map((line) => (
              <div 
                key={line.id} 
                onClick={() => setSelectedLine(line)}
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-white ${line.type === 'DDD' ? 'bg-blue-600' : 'bg-green-600'}`}>
                    <span className="text-[8px] font-bold opacity-80">{line.type}</span>
                    <span className="text-sm font-black leading-none">{line.number}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-[13px] truncate">{line.from_stop}</p>
                    <div className="flex items-center gap-1 opacity-30 my-0.5">
                       <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                       <ArrowRight size={10} />
                    </div>
                    <p className="font-bold text-slate-900 text-[13px] truncate">{line.to_stop}</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 h-5 w-5 shrink-0" />
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Search className="text-slate-200 mx-auto mb-2" size={30} />
              <p className="text-slate-400 text-xs font-medium">Aucun bus trouvé pour ce trajet.</p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER MINI CARD + ACCÈS ADMIN SÉCURISÉ */}
      <footer className="px-5 pb-6 pt-2 space-y-4">
        <div className="flex items-center gap-3">
          <a 
            href="https://moussadioufportfolio.kesug.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-white rounded-2xl p-3 flex items-center gap-3 border border-slate-200 shadow-sm active:scale-95 transition"
          >
            <img src="/moussa.jpg" alt="Moussa" className="w-10 h-10 rounded-full border-2 border-[#FFCC00] object-cover" />
            <div className="flex-1">
              <p className="text-slate-900 font-black text-[11px]">Moussa Diouf</p>
              <p className="text-slate-500 text-[9px] font-medium">Ingénieur IT • Dev</p>
            </div>
            <div className="text-[#FFCC00] font-black text-[9px] bg-black px-2 py-1 rounded-lg uppercase">CV</div>
          </a>
          
          <Link 
            to="/admin" 
            className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-sm active:scale-95 transition"
          >
            <Lock size={18} />
          </Link>
        </div>
        <p className="text-center text-slate-400 text-[9px] uppercase tracking-widest font-bold italic">© 2026 Sama Car • Dakar</p>
      </footer>
    </div>
  );
};

export default Index;