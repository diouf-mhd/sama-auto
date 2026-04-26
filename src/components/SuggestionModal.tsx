import { useState } from "react";
import { X, Send, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SuggestionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [num, setNum] = useState("");
  const [reseau, setReseau] = useState("TATA");
  const [stops, setStops] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      // 1. Sauvegarde dans Supabase (Correction du typage strict avec "as any")
      const { error } = await (supabase as any)
        .from("suggestions")
        .insert([
          { 
            ligne_numero: num, 
            reseau: reseau, 
            arrets_proposes: stops 
          }
        ]);

      if (error) throw error;

      // 2. Préparation du message WhatsApp
      const phone = "221779061173";
      // On encode le message pour qu'il soit compatible avec une URL
      const message = encodeURIComponent(
        `*Nouvelle Suggestion Sama Car* 🚍\n\n` +
        `*Ligne :* ${num}\n` +
        `*Réseau :* ${reseau}\n` +
        `*Trajet proposé :* ${stops}\n\n` +
        `_Envoyé depuis l'application par un utilisateur._`
      );

      // 3. Succès et redirection
      setSent(true);
      toast.success("Redirection vers WhatsApp...");
      
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
        
        // Nettoyage et fermeture
        setTimeout(() => {
          setSent(false);
          onClose();
          setNum("");
          setStops("");
        }, 500);
      }, 1500);

    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      toast.error("Erreur : " + (err.message || "Impossible d'envoyer"));
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
        
        {sent ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-500 animate-bounce" />
            </div>
            <h2 className="font-black text-xl uppercase italic text-slate-900">C'est envoyé !</h2>
            <p className="text-slate-500 text-xs px-4">Merci de contribuer à l'amélioration de Sama Car. WhatsApp va s'ouvrir...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1">
                <h2 className="font-black text-2xl uppercase italic text-slate-900 leading-none">Aidez-nous 🚍</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Signalez une ligne manquante ou corrigez un trajet.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">N° Ligne</label>
                <input 
                  required 
                  placeholder="Ex: 218" 
                  className="w-full bg-slate-50 p-3.5 rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 ring-blue-500 transition-all" 
                  value={num} 
                  onChange={e => setNum(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Réseau</label>
                <select 
                  className="w-full bg-slate-50 p-3.5 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 ring-blue-500 appearance-none" 
                  value={reseau} 
                  onChange={e => setReseau(e.target.value)}
                >
                  <option value="TATA">TATA</option>
                  <option value="DDD">DDD</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Arrêts et itinéraire</label>
                <textarea 
                  required 
                  placeholder="Écrivez ici le nom des arrêts connus ou les corrections à apporter..." 
                  rows={4} 
                  className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none resize-none border-none focus:ring-2 ring-blue-500 transition-all font-medium" 
                  value={stops} 
                  onChange={e => setStops(e.target.value)} 
                />
            </div>
            
            <button 
              disabled={busy}
              type="submit" 
              className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <>Envoyer par WhatsApp <Send size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};