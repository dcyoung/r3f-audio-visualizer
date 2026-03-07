import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * R3F v10 canary was built against three 0.181 which included WebGLCubeRenderTarget
 * in the three/webgpu barrel export. Three 0.183 removed it from that path (it still
 * exists in the main 'three' package). This plugin patches the R3F dist at build/dev
 * time to import it from 'three' instead.
 *
 * Remove once R3F v10 publishes a build targeting three >= 0.183.
 */
function patchR3FWebGLCubeRenderTarget(): Plugin {
  const patchCode = (code: string) =>
    code
      .replace(/WebGLCubeRenderTarget,\s*/g, "")
      .replace(
        "from 'three/webgpu';",
        "from 'three/webgpu';\nimport { WebGLCubeRenderTarget } from 'three';",
      );

  return {
    name: "patch-r3f-webgl-cube-render-target",
    // Production build (Rollup)
    transform(code, id) {
      if (
        !id.includes("@react-three/fiber") ||
        !code.includes("WebGLCubeRenderTarget")
      ) {
        return;
      }
      return patchCode(code);
    },
    config: () => ({
      optimizeDeps: {
        esbuildOptions: {
          plugins: [
            {
              // Dev pre-bundling (esbuild)
              name: "patch-r3f-webgl-cube-render-target",
              setup(build) {
                build.onLoad(
                  { filter: /@react-three\/fiber\/dist\/.*\.mjs$/ },
                  async (args) => {
                    const fs = await import("fs");
                    const contents = await fs.promises.readFile(
                      args.path,
                      "utf8",
                    );
                    if (!contents.includes("WebGLCubeRenderTarget"))
                      return undefined;
                    return { contents: patchCode(contents), loader: "js" };
                  },
                );
              },
            },
          ],
        },
      },
    }),
  };
}

export default defineConfig({
  plugins: [patchR3FWebGLCubeRenderTarget(), tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/r3f-audio-visualizer/",
  assetsInclude: ["**/*.glb"],
});
