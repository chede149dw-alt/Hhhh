import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const [,, comp, saida, ...frames] = process.argv;
const serve = await bundle({ entryPoint: path.resolve("src/index.ts") });
const opts = { serveUrl: serve, browserExecutable: "/opt/pw-browsers/chromium", chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 180000 };
const c = await selectComposition({ ...opts, id: comp });
for (const f of frames) {
  await renderStill({ ...opts, composition: c, frame: Number(f), output: `${saida}/q${String(f).padStart(4, "0")}.png`, scale: 0.4 });
  console.log("ok", f);
}
