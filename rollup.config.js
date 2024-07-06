import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/scRYMble.ts",
  plugins: [typescript()],
  output: {
    file: "dist/scRYMble.js",
    format: "cjs"
  }
};
