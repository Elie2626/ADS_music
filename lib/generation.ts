// Couche d'abstraction de génération musicale.
// Aujourd'hui : provider mock (démo). Demain : Suno (API tierce) ou ElevenLabs Music —
// il suffira d'implémenter MusicProvider et de changer l'export en bas.

export type AdBrief = {
  company: string;
  sector: string;
  message: string;
  styleId: string;
  mood: string;
  duration: number;
  voice: string;
};

export type GeneratedAd = {
  id: string;
  brief: AdBrief;
  audioUrl: string | null; // null tant qu'aucune vraie API n'est branchée
  lyrics: string;
  createdAt: number;
};

export interface MusicProvider {
  generate(brief: AdBrief): Promise<GeneratedAd>;
}

function mockLyrics(brief: AdBrief): string {
  const { company, message } = brief;
  return [
    `(Couplet)`,
    `Quand la journée commence, une adresse en tête,`,
    `${company}, là où tout s'arrête.`,
    ``,
    `(Refrain)`,
    `${company} — ${message}`,
    `${company} — on n'attend plus que vous !`,
    ``,
    `(Outro)`,
    `${company}. ${message}.`,
  ].join("\n");
}

class MockProvider implements MusicProvider {
  async generate(brief: AdBrief): Promise<GeneratedAd> {
    // Simule la latence d'une vraie génération
    await new Promise((r) => setTimeout(r, 4500));
    return {
      id: `ad_${Math.random().toString(36).slice(2, 10)}`,
      brief,
      audioUrl: null,
      lyrics: mockLyrics(brief),
      createdAt: Date.now(),
    };
  }
}

/*
 * Provider réel : Suno via sunoapi.org, à travers nos routes /api/generate
 * (la clé API reste côté serveur). Poll toutes les 5 s, jusqu'à 5 min.
 */
class SunoProvider implements MusicProvider {
  async generate(brief: AdBrief): Promise<GeneratedAd> {
    const create = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    });
    const created = await create.json();
    if (!create.ok) {
      throw new Error(created.error ?? "La génération n'a pas pu démarrer.");
    }
    const { taskId, lyrics } = created as { taskId: string; lyrics: string };

    const deadline = Date.now() + 5 * 60_000;
    let audioUrl: string | null = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`/api/generate?taskId=${encodeURIComponent(taskId)}`);
      if (!poll.ok) continue;
      const s = (await poll.json()) as {
        status: string;
        audioUrl: string | null;
        error: string | null;
      };
      if (s.status.includes("FAILED") || s.status === "SENSITIVE_WORD_ERROR") {
        throw new Error(s.error ?? "La génération a échoué. Réessayez.");
      }
      if ((s.status === "FIRST_SUCCESS" || s.status === "SUCCESS") && s.audioUrl) {
        audioUrl = s.audioUrl;
        break;
      }
    }
    if (!audioUrl) {
      throw new Error("La génération a pris trop de temps. Réessayez.");
    }

    return {
      id: taskId,
      brief,
      audioUrl,
      lyrics,
      createdAt: Date.now(),
    };
  }
}

export const musicProvider: MusicProvider = new SunoProvider();
export const mockProvider: MusicProvider = new MockProvider();
