import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom", // This is crucial for tests that need a DOM
        globals: true, // Allow global test functions like describe, it, etc.
        setupFiles: ["./src/tests/setup.ts"], // Optional: setup file for additional test configuration
        coverage: {
            provider: "istanbul",
        },
    },
});
