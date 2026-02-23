import typescript from "@rollup/plugin-typescript";
import dtsPathAlias from "rollup-plugin-dts-path-alias";
import generatePackageJson from "rollup-plugin-generate-package-json";

const external = [/^node:.+/];

export default [
	{
		external,
		input: "src/index.ts",
		output: {
			dir: "dist/esm",
			format: "esm",
			preserveModules: true,
			sourcemap: true,
		},
		plugins: [
			dtsPathAlias(),
			typescript({
				declaration: true,
				declarationDir: "dist/esm",
				outDir: "dist/esm",
				outputToFilesystem: true,
				tsconfig: "./tsconfig.build.json",
			}),
			generatePackageJson({
				baseContents: { type: "module" },
				outputFolder: "dist/esm",
			}),
		],
	},
	{
		external,
		input: "src/index.ts",
		output: {
			dir: "dist/cjs",
			exports: "named",
			format: "cjs",
			preserveModules: true,
			sourcemap: true,
		},
		plugins: [
			dtsPathAlias(),
			typescript({
				declaration: true,
				declarationDir: "dist/cjs",
				outDir: "dist/cjs",
				outputToFilesystem: true,
				tsconfig: "./tsconfig.build.json",
			}),
			generatePackageJson({
				baseContents: { type: "commonjs" },
				outputFolder: "dist/cjs",
			}),
		],
	},
];
