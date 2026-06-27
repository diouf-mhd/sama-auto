import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Bus, ChevronRight, MapPin, Navigation, Search, ArrowRight, Lock, Clock, Zap, Info, Heart, Copy, X, ExternalLink, Send, CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineDetail } from "@/components/LineDetail";
import { toast } from "sonner";

// --- COMPOSANT D'ANIMATION AU SCROLL ---
const FadeInScroll = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setVisible(true);
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);

  return (
    <div ref={domRef} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {children}
    </div>
  );
};

// --- COMPOSANT MODAL AIDEZ-NOUS (CORRIGÉ) ---
const SuggestionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [num, setNum] = useState("");
  const [reseau, setReseau] = useState("TATA");
  const [stops, setStops] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await (supabase as any).from("suggestions").insert([
        { ligne_numero: num, reseau: reseau, arrets_proposes: stops }
      ]);

      if (error) throw error;

      const phone = "221779061173";
      const message = encodeURIComponent(
        `*Nouvelle Suggestion Sama Car* 🚍\n\n` +
        `*Ligne :* ${num}\n` +
        `*Réseau :* ${reseau}\n` +
        `*Trajet :* ${stops}\n\n` +
        `_Envoyé depuis l'application._`
      );

      setSent(true);
      setTimeout(() => { 
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
        setSent(false); 
        onClose(); 
        setNum(""); 
        setStops(""); 
        setLoading(false);
      }, 1500);

    } catch (err: any) {
      toast.error("Erreur d'envoi : " + err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300"><X /></button>
        
        {sent ? (
          <div className="text-center py-10 space-y-4">
            <CheckCircle2 size={60} className="text-green-500 mx-auto animate-bounce" />
            <h2 className="font-black text-xl uppercase italic">Merci !</h2>
            <p className="text-slate-500 text-xs px-6">WhatsApp va s'ouvrir pour finaliser l'envoi de votre suggestion.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <h2 className="font-black text-xl uppercase italic text-slate-900">Aidez-nous 🚍</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Une ligne manque ou un trajet est faux ? Proposez une mise à jour.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">N° Ligne</label>
                <input required placeholder="Ex: 218" className="w-full bg-slate-50 p-3.5 rounded-2xl text-sm outline-none font-bold border-none focus:ring-2 ring-blue-500 transition-all" value={num} onChange={e=>setNum(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Réseau</label>
                <select className="w-full bg-slate-50 p-3.5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-500 appearance-none" value={reseau} onChange={e=>setReseau(e.target.value)}>
                  <option>TATA</option>
                  <option>DDD</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Trajet détaillé</label>
               <textarea required placeholder="Dites nous tout..." rows={3} className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none resize-none border-none focus:ring-2 ring-blue-500 transition-all" value={stops} onChange={e=>setStops(e.target.value)} />
            </div>
            
            <button disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>Envoyer <Send size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ✅ FONCTION DE TRI NUMÉRIQUE CROISSANT
const sortByNumber = (arr: any[]) => {
  return [...arr].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numA - numB;
  });
};

const Index = () => {
  const [lines, setLines] = useState<any[]>([]);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"DDD" | "TATA" | null>(null);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  useEffect(() => {
    const fetchLines = async () => {
      const { data } = await supabase.from("bus_lines").select("*");
      if (data) setLines(data);
    };
    fetchLines();
  }, []);

  const stats = useMemo(() => ({
    ddd: lines.filter(l => l.type === "DDD").length,
    tata: lines.filter(l => l.type === "TATA").length
  }), [lines]);

  const filteredLines = useMemo(() => {
    const start = startPoint.trim().toLowerCase();
    const end = endPoint.trim().toLowerCase();
    const result = lines.filter((l) => {
      const matchType = selectedType ? l.type === selectedType : true;
      const allStopsStr = (l.stops || []).join(" ").toLowerCase();
      return matchType && (start ? allStopsStr.includes(start) : true) && (end ? allStopsStr.includes(end) : true);
    });
    return sortByNumber(result);
  }, [startPoint, endPoint, selectedType, lines]);

  const handleWaveDonation = () => {
    toast.success("Ouverture de Wave...");
    setTimeout(() => {
      window.open("https://pay.wave.com/m/M_sn_Mes0aIYav5Hz/c/sn/", "_blank");
      setShowDonationModal(false);
    }, 800);
  };

  if (selectedLine) return <LineDetail line={selectedLine} onBack={() => setSelectedLine(null)} />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans max-w-md mx-auto shadow-2xl relative overflow-x-hidden text-slate-900">
      
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 15s linear infinite; }
      `}</style>

      {/* HEADER */}
      <header className="bg-[#FFCC00] pt-8 pb-12 px-6 rounded-b-[40px] shadow-xl relative z-30">
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-2xl shadow-lg rotate-3"><Bus className="text-[#FFCC00] h-6 w-6" /></div>
            <h1 className="text-black text-xl font-black uppercase italic tracking-tighter leading-none">Sama Car</h1>
          </div>
          <div className="bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] text-black font-black uppercase tracking-tighter">Dakar Live 🇸🇳</div>
        </div>

        <div className="bg-white rounded-[2rem] p-4 shadow-2xl shadow-black/10 border border-white relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Navigation size={16} className="text-blue-500 shrink-0" />
              <input type="text" placeholder="Départ (ex: Liberté 6)" className="w-full outline-none text-[15px] font-bold" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} />
            </div>
            <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
              <MapPin size={16} className="text-red-500 shrink-0" />
              <input type="text" placeholder="Destination (ex: Colobane)" className="w-full outline-none text-[15px] font-bold" value={endPoint} onChange={(e) => setEndPoint(e.target.value)} />
            </div>
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="bg-slate-900 py-2 relative z-10 -mt-2 overflow-hidden">
        <div className="animate-marquee">
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] px-4">
             Sama Car : L'application est gratuite et collaborative • Soutenez-nous sur Wave pour plus de fonctionnalités ! 🇸🇳
          </span>
        </div>
      </div>

      <main className="flex-1 px-5 mt-6 relative z-20 pb-32">
        <div className="flex gap-2 mb-8">
            <button onClick={() => setSelectedType(selectedType === "DDD" ? null : "DDD")} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${selectedType === "DDD" ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><Bus size={14} /> DDD ({stats.ddd})</button>
            <button onClick={() => setSelectedType(selectedType === "TATA" ? null : "TATA")} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${selectedType === "TATA" ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><Zap size={14} /> TATA ({stats.tata})</button>
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 tracking-tight px-1 uppercase italic"><Info size={14} className="text-blue-500" /> Itinéraires</h3>
          <div className="grid gap-4">
            {filteredLines.length > 0 ? (
              filteredLines.map((line) => (
                <FadeInScroll key={line.id}>
                  <div onClick={() => setSelectedLine(line)} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.97] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg ${line.type === 'DDD' ? 'bg-blue-600' : 'bg-green-600'}`}>
                        <span className="text-[16px] font-black leading-none">{line.number}</span>
                        <span className="text-[7px] font-bold uppercase opacity-70 mt-1">{line.type}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-[13px] truncate uppercase">{line.from_stop}</p>
                        <ArrowRight size={10} className="my-0.5 text-slate-300" />
                        <p className="font-black text-slate-900 text-[13px] truncate uppercase">{line.to_stop}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200" />
                  </div>
                </FadeInScroll>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 italic text-sm">Aucun trajet trouvé...</div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER RÉORGANISÉ */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center gap-3 z-50 max-w-md mx-auto">
          {/* CARTE PORTFOLIO */}
          <a href="https://moussadioufportfolio.kesug.com" target="_blank" className="flex-1 flex items-center gap-3 bg-slate-900 px-3 py-2.5 rounded-2xl shadow-xl active:scale-95 transition-transform">
            <img src="/moussa.jpg" alt="M" className="w-8 h-8 rounded-full border border-yellow-400 object-cover" />
            <div className="min-w-0"><p className="text-white font-black text-[9px] leading-none truncate uppercase tracking-tighter">Moussa Diouf</p><p className="text-blue-400 text-[6px] font-bold uppercase mt-1 tracking-widest leading-none">Portfolio</p></div>
          </a>

          {/* ACTIONS GROUPÉES */}
          <div className="flex items-center gap-2">
            {/* BOUTON DON WAVE */}
            <button onClick={() => setShowDonationModal(true)} className="bg-blue-500 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-100 active:scale-90 transition-all">
              <Heart size={18} fill="currentColor" />
            </button>

            {/* BOUTON AIDEZ-NOUS (AJOUTER LIGNE) */}
            <button onClick={() => setShowSuggestModal(true)} className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-100 active:scale-90 transition-all">
              <PlusCircle size={18} />
            </button>

            {/* BOUTON ADMIN */}
            <Link to="/admin" className="bg-yellow-400 p-3.5 rounded-2xl text-black shadow-lg shadow-yellow-100 active:rotate-12 transition-all">
              <Lock size={18} />
            </Link>
          </div>
      </footer>

      <SuggestionModal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} />

      {/* MODAL DE DON WAVE */}
      {showDonationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDonationModal(false)}></div>
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 relative z-10 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-white">
            <button onClick={() => setShowDonationModal(false)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors"><X size={20}/></button>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 italic">
              <Zap size={30} className="text-blue-500" fill="currentColor" />
            </div>
            <h2 className="text-slate-900 font-black text-xl mb-2 uppercase italic tracking-tight leading-none">M2S Business</h2>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed mb-8 italic">
              "L'application est gratuite. Ton soutien permet de financer les serveurs et le développement de Sama Car."
            </p>
            <button onClick={handleWaveDonation} className="w-full bg-blue-600 p-5 rounded-2xl text-white font-black text-sm uppercase shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all mb-4">
              Payer via Wave <ExternalLink size={16} />
            </button>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Paiement sécurisé par Wave</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;