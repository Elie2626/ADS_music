import { Composition, staticFile } from "remotion";
import { PubVideo, pubVideoSchema } from "./PubVideo";

const FPS = 30;
const DEMO_DURATION_S = 30;

/*
 * Deux formats : 9:16 (TikTok/Reels/Stories) et 1:1 (feed).
 * Les props par défaut utilisent le jingle de démo "Onde en boucle".
 */
export const RemotionRoot: React.FC = () => {
  const defaults = {
    audioSrc: staticFile("audio/demo-onde.mp3"),
    coverSrc: staticFile("audio/demo-cover.jpg"),
    company: "Boulangerie Martin",
    tagline: "Le meilleur pain frais du quartier",
    hue: "#9d8cff",
  };

  return (
    <>
      <Composition
        id="PubVertical"
        component={PubVideo}
        durationInFrames={DEMO_DURATION_S * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaults}
        schema={undefined}
      />
      <Composition
        id="PubSquare"
        component={PubVideo}
        durationInFrames={DEMO_DURATION_S * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaults}
        schema={undefined}
      />
    </>
  );
};

void pubVideoSchema;
