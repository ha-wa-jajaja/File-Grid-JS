import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import scss from "rollup-plugin-scss";
import dts from "rollup-plugin-dts";

export default [
    {
        input: "index.ts",
        output: [
            {
                file: "dist/index.mjs",
                format: "es",
                sourcemap: true,
            },
            {
                file: "dist/index.cjs",
                format: "cjs",
                sourcemap: true,
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: true,
                declarationDir: "./dist/types",
            }),
            scss({
                fileName: "bundle.css",
                outputStyle: "compressed",
                // If you want source maps for your CSS
                sourceMap: true,
                // If you want to process SCSS
                processor: () => require("sass"),
            }),
        ],
        external: [], // Add any external dependencies here
    },
    // Generate .d.ts files
    {
        input: "index.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
