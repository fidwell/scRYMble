import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { scRYMbleBanner } from "./meta/scRYMbleBanner.js";
import { getVersion } from "./meta/version.js";

function userscriptBanner() {
  const banner = scRYMbleBanner.replace("__buildDate__", getVersion());
  return {
    name: "userscript-banner",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk") {
          file.code = `${banner}\n${file.code}`;
        }
      }
    }
  };
}

export default {
  input: "src/scRYMble.ts",
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" })
  ],
  output: [
    {
      file: "dist/scRYMble.js",
      format: "cjs",
      plugins: [userscriptBanner()]
    },
    {
      file: "dist/scRYMble.min.js",
      format: "iife",
      plugins: [terser(), userscriptBanner()]
    }
  ]
};
