import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // On cible l'endpoint public d'authentification pour réveiller l'instance de manière robuste
  const supabaseHealthUrl = "https://zzrkitcfzjgvdgvynbrn.supabase.co/auth/v1/settings";

  try {
    const response = await fetch(supabaseHealthUrl, {
      method: 'GET'
    });

    // Tant que le serveur répond (qu'il renvoie 200, 401 ou même 400), cela prouve 
    // que l'instance sous-jacente s'est activée pour traiter la requête !
    if (response.status === 200 || response.status === 401 || response.status === 400) {
      return res.status(200).json({ message: "Succès : Sama Auto est bien réveillé !" });
    } else {
      return res.status(response.status).json({ error: `Statut serveur inattendu : ${response.status}` });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erreur réseau lors du réveil" });
  }
}
