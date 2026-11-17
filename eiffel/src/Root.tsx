import React from "react";
import { Composition } from "remotion";
import { EiffelShort, EiffelProfile, EIFFEL_FRAMES } from "./videos/eiffel/Eiffel";
export const Root: React.FC = () => (
  <>
    <Composition id="EiffelShort" component={EiffelShort} durationInFrames={EIFFEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="EiffelProfile" component={EiffelProfile} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
