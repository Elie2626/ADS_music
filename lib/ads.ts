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
import type { GeneratedAd } from "@/lib/generation";

export type SavedAd = {
  id: string;
  userId: string;
  company: string;
  sector: string;
  message: string;
  styleId: string;
  mood: string;
  duration: number;
  voice: string;
  lyrics: string;
  audioUrl: string | null;
  createdAt: number;
};

export async function saveAd(userId: string, ad: GeneratedAd): Promise<void> {
  await addDoc(collection(db, "ads"), {
    userId,
    ...ad.brief,
    lyrics: ad.lyrics,
    audioUrl: ad.audioUrl,
    createdAt: serverTimestamp(),
  });
}

export async function listAds(userId: string): Promise<SavedAd[]> {
  const q = query(
    collection(db, "ads"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      company: data.company,
      sector: data.sector ?? "",
      message: data.message,
      styleId: data.styleId,
      mood: data.mood,
      duration: data.duration,
      voice: data.voice,
      lyrics: data.lyrics,
      audioUrl: data.audioUrl ?? null,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    };
  });
}
