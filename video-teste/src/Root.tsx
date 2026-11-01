import { Composition } from "remotion";
import { NovaColecao } from "./NovaColecao";
import { CuriosidadeMinecraft } from "./minecraft/CuriosidadeMinecraft";
import T from "./minecraft/timing.json";
import { ReelsMenino } from "./reels/ReelsMenino";
import { DURACAO } from "./reels/letra";
import { ReelsMotion } from "./reels/ReelsMotion";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="NovaColecao"
      component={NovaColecao}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="CuriosidadeMinecraft"
      component={CuriosidadeMinecraft}
      durationInFrames={T.duration}
      fps={T.fps}
      width={1080}
      height={1920}
    />
    <Composition
      id="ReelsMenino"
      component={ReelsMenino}
      durationInFrames={Math.round(DURACAO * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="ReelsMotion"
      component={ReelsMotion}
      durationInFrames={Math.round(DURACAO * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
