import { Composition } from "remotion";
import { NovaColecao } from "./NovaColecao";
import { CuriosidadeMinecraft } from "./minecraft/CuriosidadeMinecraft";
import T from "./minecraft/timing.json";
import { Poses } from "./luta/Poses";
import { LutaAnime } from "./luta/LutaAnime";
import TL from "./luta/timing.json";

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
    <Composition id="LutaAnime" component={LutaAnime} durationInFrames={TL.duration} fps={TL.fps} width={1080} height={1920} />
    <Composition id="LutaPoses" component={Poses} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
);
