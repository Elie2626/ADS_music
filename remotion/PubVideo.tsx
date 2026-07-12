import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

/*
 * Composition "visualizer" ONDE — thème violet néon.
 * Fond animé, pochette au centre, waveform réactive au VRAI son du jingle,
 * nom de l'entreprise + accroche. Rendue en 9:16 et 1:1.
 */

export type PubVideoProps = {
  audioSrc: string;
  coverSrc: string;
  company: string;
  tagline: string;
  hue: string;
};

export const pubVideoSchema = {
  audioSrc: "",
  coverSrc: "",
  company: "",
  tagline: "",
  hue: "#9d8cff",
};

const INK = "#12101a";
const CREAM = "#f0edfb";

export const PubVideo: React.FC<PubVideoProps> = ({
  audioSrc,
  coverSrc,
  company,
  tagline,
  hue,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();
  const audioData = useAudioData(audioSrc);

  const BARS = 64;
  const amplitudes = audioData
    ? visualizeAudio({
        fps,
        frame,
        audioData,
        numberOfSamples: BARS,
        smoothing: true,
      })
    : new Array(BARS).fill(0);

  // Entrée de la pochette (ressort) + halo qui respire
  const coverScale = spring({ frame, fps, config: { damping: 14 } });
  const glow =
    0.35 + Math.sin(frame / 8) * 0.15 + (amplitudes[4] ?? 0) * 3;

  // Fondu de fin
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const coverSize = Math.round(width * 0.32);

  return (
    <AbsoluteFill style={{ background: INK, opacity: fadeOut }}>
      <Audio src={audioSrc} />

      {/* Halo réactif derrière la pochette */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: coverSize * 2.4,
            height: coverSize * 2.4,
            borderRadius: "50%",
            background: hue,
            filter: "blur(120px)",
            opacity: Math.min(glow, 0.6),
          }}
        />
      </AbsoluteFill>

      {/* Contenu centré */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 48,
          padding: 60,
        }}
      >
        <Img
          src={coverSrc}
          style={{
            width: coverSize,
            height: coverSize,
            borderRadius: 28,
            objectFit: "cover",
            transform: `scale(${coverScale})`,
            border: `2px solid ${hue}`,
            boxShadow: `0 0 60px ${hue}88`,
          }}
        />

        {/* Waveform réactive */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: coverSize * 0.5,
            width: "88%",
          }}
        >
          {amplitudes.map((amp, i) => {
            const h = Math.max(10, Math.min(coverSize * 0.5, amp * coverSize * 9));
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 12,
                  height: h,
                  borderRadius: 6,
                  background: i % 6 === 0 ? CREAM : hue,
                }}
              />
            );
          })}
        </div>

        {/* Nom entreprise */}
        <Sequence from={12} layout="none">
          <TextBlock company={company} tagline={tagline} hue={hue} />
        </Sequence>
      </AbsoluteFill>

      {/* Watermark ONDE */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          width: "100%",
          textAlign: "center",
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: -1,
          color: CREAM,
          opacity: 0.85,
        }}
      >
        ONDE<span style={{ color: hue }}>.</span>
      </div>
    </AbsoluteFill>
  );
};

const TextBlock: React.FC<{ company: string; tagline: string; hue: string }> = ({
  company,
  tagline,
  hue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const y = interpolate(enter, [0, 1], [30, 0]);

  return (
    <div
      style={{
        textAlign: "center",
        transform: `translateY(${y}px)`,
        opacity: enter,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          color: CREAM,
          letterSpacing: -2,
          lineHeight: 1.05,
        }}
      >
        {company}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 34,
          fontWeight: 500,
          color: hue,
        }}
      >
        {tagline}
      </div>
    </div>
  );
};
