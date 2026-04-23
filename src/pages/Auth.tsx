import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "dioufmoussa20030918@gmail.com";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email !== ADMIN_EMAIL) {
      toast("Accès non autorisé");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      toast("Email ou mot de passe incorrect");
      return;
    }

    toast("Connexion réussie ✅");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-yellow-200 to-green-200">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">

        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="text-center mt-4">
          <div className="mx-auto h-12 w-12 bg-green-700 rounded-2xl flex items-center justify-center text-white">
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="mt-3 text-xl font-bold text-green-800">
            Admin privé
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Accès réservé au propriétaire
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">

          <input
            type="email"
            placeholder="Email admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-800 transition"
          >
            <LogIn className="inline mr-2 h-4 w-4" />
            {busy ? "Connexion..." : "Se connecter"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Auth;