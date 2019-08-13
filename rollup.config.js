import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";

export default {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    "http-status-codes",
    "jsonld",
    "node-fetch",
    "rdflib",
    "redux",
    "redux-actions",
    "react",
    "link-lib",
    "prop-types",
  ],
  input: "src/link-redux.ts",
  output: [
    { file: "dist/link-redux.umd.js", name: "linkRedux", format: "umd", sourcemap: true },
    { file: "dist/link-redux.es6.js", format: "es", sourcemap: true },
  ],
  plugins: [
    // Compile TypeScript files
    typescript({
      typescript: require("typescript"),
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
  watch: {
    include: "src/**",
  },
};
