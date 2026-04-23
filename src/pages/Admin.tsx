import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
  Pencil,
  X
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BusType = "DDD" | "TATA";

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();

  const [lines, setLines] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulaire states
  const [number, setNumber] = useState("");
  const [stops, setStops] = useState("");
  const [type, setType] = useState<BusType>("DDD");
  const [busy, setBusy] = useState(false);

  // 1. Charger les lignes
  const fetchLines = async () => {
    try {
      const { data, error } = await supabase
        .from("bus_lines")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLines(data || []);
    } catch (error: any) {
      console.error("Erreur Fetch:", error);
      toast.error("Impossible de charger les données");
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchLines();
  }, [user, isAdmin]);

  // 2. Protection de route
  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center text-center bg-slate-50 px-6">
        <div>
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold text-xl text-slate-800">Accès restreint</p>
          <p className="text-slate-500 text-sm mb-6">Vous n'avez pas les droits d'administrateur.</p>
          <button onClick={() => navigate("/")} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setNumber("");
    setStops("");
    setType("DDD");
    setEditingId(null);
  };

  // 3. AJOUTER ou MODIFIER
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des entrées
    const stopList = stops.split(",").map((s) => s.trim()).filter(Boolean);
    if (!number || stopList.length < 2) {
      toast.error("Veuillez entrer un numéro et au moins 2 arrêts");
      return;
    }

    // Préparation de l'objet de données
    const lineData = {
      number: number,
      type: type,
      from_stop: stopList[0],
      to_stop: stopList[stopList.length - 1],
      stops: stopList,
      // On n'ajoute created_by que pour les nouvelles lignes
    };

    setBusy(true);

    try {
      if (editingId) {
        // --- MISE À JOUR (UPDATE) ---
        const { error } = await supabase
          .from("bus_lines")
          .update(lineData)
          .eq("id", editingId);
        
        if (error) throw error;
        toast.success("Ligne mise à jour avec succès !");
      } else {
        // --- CRÉATION (INSERT) ---
        const { error } = await supabase
          .from("bus_lines")
          .insert([{ 
            ...lineData, 
            created_by: user?.id // Indispensable pour la Policy RLS
          }]);
        
        if (error) throw error;
        toast.success("Nouvelle ligne ajoutée !");
      }
      
      resetForm();
      await fetchLines(); // Recharger la liste
    } catch (err: any) {
      console.error("Erreur Supabase détaillée:", err);
      // Message d'erreur spécifique si RLS bloque
      if (err.code === "42501") {
        toast.error("Erreur de permission (RLS) : Vérifiez vos politiques Supabase");
      } else {
        toast.error(err.message || "Une erreur est survenue");
      }
    } finally {
      setBusy(false);
    }
  };

  // 4. SUPPRIMER
  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ligne définitivement ?")) return;

    try {
      const { error } = await supabase
        .from("bus_lines")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Ligne supprimée");
      setLines(lines.filter(l => l.id !== id)); // Mise à jour locale rapide
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // 5. REMPLIR LE FORMULAIRE POUR MODIFIER
  const handleEdit = (line: any) => {
    setEditingId(line.id);
    setNumber(line.number);
    setStops(line.stops ? line.stops.join(", ") : "");
    setType(line.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto border-x border-slate-200 shadow-xl">
      {/* HEADER */}
      <header className="bg-yellow-400 p-6 rounded-b-[30px] shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="bg-white/20 p-2 rounded-full text-black hover:bg-white/40 transition-colors">
            <ArrowLeft size={20}/>
          </Link>
          <button onClick={signOut} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-transform">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
        <h1 className="text-xl font-black text-black uppercase italic tracking-tight">Dashboard Admin 🇸🇳</h1>
        <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest truncate">{user?.email}</p>
      </header>

      <div className="p-5 space-y-6">
        {/* FORMULAIRE D'AJOUT / MODIF */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              {editingId ? "✍️ Mode Modification" : "➕ Nouveau trajet"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-red-500 p-1.5 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                <X size={16}/>
              </button>
            )}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Numéro de ligne</label>
                <input 
                  required
                  value={number} 
                  onChange={(e) => setNumber(e.target.value)} 
                  placeholder="Ex: 64" 
                  className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-yellow-400 transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type de Réseau</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as BusType)} 
                  className="w-full p-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-yellow-400 appearance-none cursor-pointer"
                >
                  <option value="DDD">DDD</option>
                  <option value="TATA">TATA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Arrêts (séparés par virgules)</label>
              <textarea 
                required
                value={stops} 
                onChange={(e) => setStops(e.target.value)} 
                rows={3} 
                placeholder="Terminus 1, Arrêt A, Arrêt B, Destination..." 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-yellow-400 resize-none transition-all placeholder:text-slate-300" 
              />
            </div>

            <button 
              type="submit" 
              disabled={busy} 
              className="w-full bg-yellow-400 p-4 rounded-2xl font-black text-black uppercase shadow-lg shadow-yellow-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Patientez...
                </span>
              ) : editingId ? "Enregistrer les modifications" : "Publier sur l'application"}
            </button>
          </form>
        </div>

        {/* LISTE DES LIGNES */}
        <div className="space-y-4 pb-12">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Base de données ({lines.length})</h3>
          </div>
          
          <div className="grid gap-3">
            {lines.map((line) => (
              <div key={line.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-yellow-200 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-inner ${line.type === 'DDD' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {line.number}
                  </div>
                  <div className="max-w-[160px]">
                    <p className="font-bold text-slate-800 text-sm truncate leading-tight">{line.from_stop} → {line.to_stop}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{line.stops?.length || 0} arrêts</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{line.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(line)} 
                    className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(line.id)} 
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {lines.length === 0 && !busy && (
            <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-medium italic">Aucune ligne dans la base.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;