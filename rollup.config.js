import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { scRYMbleBanner } from "./src/meta/scRYMbleBanner.js";
import { getVersion } from "./src/meta/version.js";

export default {
  input: "src/scRYMble.ts",
  plugins: [
    typescript(),
    replace({
      preventAssignment: true,
      __buildDate__: getVersion
    })
  ],
  output: [
    {
      banner: scRYMbleBanner,
      file: "dist/scRYMble.js",
      format: "cjs"
    },
    {
      banner: scRYMbleBanner,
      file: "dist/scRYMble.min.js",
      format: "iife",
      plugins: [
        terser({
          format: {
            comments: "all"
          }
        })
      ]
    }
  ]
};
