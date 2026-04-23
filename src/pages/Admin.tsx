import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bus,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BusType = "DDD" | "TATA";

const lineSchema = z.object({
  number: z.string().trim().min(1),
  from_stop: z.string().trim().min(1),
  to_stop: z.string().trim().min(1),
  stops: z.array(z.string()).min(2),
  type: z.enum(["DDD", "TATA"]),
  duration: z.string().optional(),
  frequency: z.string().optional(),
  price: z.number().optional(),
});

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();

  const [lines, setLines] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [number, setNumber] = useState("");
  const [stops, setStops] = useState("");
  const [type, setType] = useState<BusType>("DDD");
  const [duration, setDuration] = useState("");
  const [frequency, setFrequency] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchLines = async () => {
    const { data } = await supabase
      .from("bus_lines")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLines(data);
  };

  useEffect(() => {
    fetchLines();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center text-center">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <p className="mt-2 font-semibold">Accès refusé</p>
      </div>
    );
  }

  const resetForm = () => {
    setNumber("");
    setStops("");
    setDuration("");
    setFrequency("");
    setPrice("");
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stopList = stops.split(",").map((s) => s.trim()).filter(Boolean);

    const parsed = lineSchema.safeParse({
      number,
      type,
      from_stop: stopList[0],
      to_stop: stopList[stopList.length - 1],
      stops: stopList,
      duration,
      frequency,
      price: price ? parseInt(price) : undefined,
    });

    if (!parsed.success) {
      toast("Données invalides");
      return;
    }

    setBusy(true);

    if (editingId) {
      await supabase
        .from("bus_lines")
        .update(parsed.data)
        .eq("id", editingId);
      toast("✅ Ligne modifiée");
    } else {
      await supabase
        .from("bus_lines")
        .insert({ ...parsed.data, created_by: user!.id });
      toast("✅ Ligne ajoutée");
    }

    setBusy(false);
    resetForm();
    fetchLines();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bus_lines").delete().eq("id", id);
    toast("❌ Ligne supprimée");
    fetchLines();
  };

  const handleEdit = (line: any) => {
    setEditingId(line.id);
    setNumber(line.number);
    setStops(line.stops.join(", "));
    setType(line.type);
    setDuration(line.duration || "");
    setFrequency(line.frequency || "");
    setPrice(line.price?.toString() || "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-green-200 p-6">

      {/* HEADER */}
      <div className="bg-yellow-400 p-6 rounded-3xl shadow-xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-green-900">
            Dashboard Admin 🇸🇳
          </h1>
          <p className="text-sm text-green-800">
            Connecté : {user?.email}
          </p>
        </div>

        <button
          onClick={signOut}
          className="bg-white px-4 py-2 rounded-xl shadow-md text-green-700 font-semibold hover:scale-105 transition"
        >
          <LogOut className="inline h-4 w-4 mr-1" />
          Déconnexion
        </button>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-10">
        <h2 className="font-bold text-lg mb-4">
          {editingId ? "Modifier ligne" : "Ajouter ligne"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Numéro"
            className="w-full p-3 border rounded-xl"
          />

          <textarea
            value={stops}
            onChange={(e) => setStops(e.target.value)}
            placeholder="Arrêts séparés par virgule"
            className="w-full p-3 border rounded-xl"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as BusType)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="DDD">DDD</option>
            <option value="TATA">TATA</option>
          </select>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 transition"
          >
            {busy
              ? "Chargement..."
              : editingId
              ? "Mettre à jour"
              : "Ajouter"}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {lines.map((line) => (
          <div
            key={line.id}
            className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center hover:shadow-lg transition"
          >
            <div>
              <p className="font-bold text-green-800">
                Ligne {line.number} ({line.type})
              </p>
              <p className="text-sm text-gray-600">
                {line.from_stop} → {line.to_stop}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleEdit(line)}>
                <Pencil className="h-5 w-5 text-yellow-500 hover:scale-110 transition" />
              </button>
              <button onClick={() => handleDelete(line.id)}>
                <Trash2 className="h-5 w-5 text-red-600 hover:scale-110 transition" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Admin;