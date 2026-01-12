import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import sonarReporter from "vitest-sonar-reporter";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			reportsDirectory: "coverage",
			include: ["src/**/*.ts"],
			exclude: ["src/index.ts"],
		},
		reporters: ["default", new sonarReporter({ outputFile: "radar.xml" })],
		setupFiles: ["./tests/setup.ts"],
	},
});
