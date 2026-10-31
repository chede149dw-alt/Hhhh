import { Composition } from "remotion";
import { NovaColecao } from "./NovaColecao";
import { CuriosidadeMinecraft } from "./minecraft/CuriosidadeMinecraft";
import T from "./minecraft/timing.json";

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
  </>
);
