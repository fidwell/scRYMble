import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { scRYMbleBanner } from "./scRYMbleBanner.js";

function pad(value) {
  return `00${value}`.slice(-2);
}

const now = new Date(new Date().toUTCString().slice(0, -4));
const setVersion = replace({
  preventAssignment: true,
  __buildDate__: () => `2.${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
});

export default {
  input: "src/scRYMble.ts",
  plugins: [
    typescript(),
    setVersion
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
