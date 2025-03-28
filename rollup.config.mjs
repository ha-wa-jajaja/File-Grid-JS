import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import scss from "rollup-plugin-scss";
import dts from "rollup-plugin-dts";
import sass from "sass";

export default [
    {
        input: "src/index.ts",
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
                fileName: "styles/index.css", // Explicit file name
                failOnError: true,
                runtime: sass,
                watch: "styles",
                outputStyle: "compressed",
            }),
        ],
        external: [], // Add any external dependencies here
    },
    // Generate .d.ts files
    {
        input: "src/index.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
