import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { scRYMbleBanner } from "./meta/scRYMbleBanner.js";
import { getVersion } from "./meta/version.js";

function userscriptBanner() {
  return {
    name: "userscript-banner",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk") {
          file.code = `${scRYMbleBanner}\n${file.code}`;
        }
      }
    }
  };
}

export default {
  input: "src/scRYMble.ts",
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" }),
    replace({
      preventAssignment: true,
      __buildDate__: getVersion
    })
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
