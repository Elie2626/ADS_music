import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DevisRequest, GeneratedQuote } from "@/app/api/devis/route";

export type SavedDevis = DevisRequest & {
  id: string;
  quote: GeneratedQuote;
  createdAt: number;
};

/* Enregistre le lead de devis dans Firestore (collection "devis") */
export async function saveDevis(
  req: DevisRequest,
  quote: GeneratedQuote,
  userId: string | null
): Promise<void> {
  await addDoc(collection(db, "devis"), {
    ...req,
    quote,
    userId,
    status: "nouveau",
    createdAt: serverTimestamp(),
  });
}

/* Liste les devis d'un utilisateur, du plus récent au plus ancien */
export async function listDevis(userId: string): Promise<SavedDevis[]> {
  const q = query(
    collection(db, "devis"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      company: data.company,
      sector: data.sector ?? "",
      message: data.message,
      style: data.style,
      duration: data.duration,
      budget: data.budget,
      deadline: data.deadline,
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      quote: data.quote,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });
}
