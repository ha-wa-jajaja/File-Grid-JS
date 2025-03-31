// src/tests/setup.ts
import { vi } from "vitest";

// Setup any global mocks here
window.requestAnimationFrame = vi.fn((callback) => {
    return setTimeout(callback, 0) as unknown as number;
});

window.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
});

// Add any other global mocks or setup code
Object.defineProperty(window, "scrollY", { value: 0, writable: true });
