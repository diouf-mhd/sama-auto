import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // On tape directement à la racine de l'API Supabase pour vérifier qu'elle répond
  const supabaseUrl = "https://oyiiwzbmmsewjwrzjfpd.supabase.co/rest/v1/";
  const supabaseKey = "sb_publishable_uJnDx-se2jUqGkht6_Rh2A_Vcfddy8D";

  try {
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    // Si Supabase répond avec un statut 200 (Success), le projet est réveillé
    if (response.ok) {
      return res.status(200).json({ message: "Succès : Sama Auto est bien réveillé !" });
    } else {
      return res.status(response.status).json({ error: `Supabase a répondu avec le code ${response.status}` });
    }
  } catch (error) {
    return res.status(500).json({ error: "Erreur réseau lors du réveil" });
  }
}
