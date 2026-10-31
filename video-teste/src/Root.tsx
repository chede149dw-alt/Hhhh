import { Composition } from "remotion";
import { NovaColecao } from "./NovaColecao";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NovaColecao"
    component={NovaColecao}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
  />
);
