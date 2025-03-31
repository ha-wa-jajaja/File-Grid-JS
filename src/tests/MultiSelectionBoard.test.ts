import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MultiSelectionBackboard from "../components/MultiSelectionBoard";

// Mock utils
const mockGetElement = vi.fn();

vi.mock("../../utils", () => ({
    utils: () => ({
        getElement: mockGetElement,
    }),
}));

describe("MultiSelectionBackboard", () => {
    let rootElement: HTMLElement;
    let counterElement: HTMLElement;

    beforeEach(() => {
        // Set up the DOM elements for testing
        rootElement = document.createElement("div");
        counterElement = document.createElement("span");
        counterElement.classList.add("file-grid__selected-count");

        // Add counter element to root
        rootElement.appendChild(counterElement);

        // Add to document body
        document.body.appendChild(rootElement);

        // Reset the mock for each test
        mockGetElement.mockReset();
        mockGetElement.mockImplementation((el) => {
            if (el instanceof HTMLElement) return el;
            return document.querySelector(el) || document.createElement("div");
        });
    });

    afterEach(() => {
        // Clean up after each test
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should initialize correctly", () => {
        // Create a MultiSelectionBackboard instance
        const board = new MultiSelectionBackboard(rootElement);

        // Verify that the internal elements are set correctly
        expect(board.el).toBe(rootElement);

        // According to implementation, the counter is not automatically set to "0" on init
        // We need to set it explicitly to verify the mechanism works
        board.selectedCount = 0;
        expect(counterElement.textContent).toBe("0");
    });

    it("should update selected count when setter is called", () => {
        const board = new MultiSelectionBackboard(rootElement);

        // Set selected count to a specific value
        board.selectedCount = 5;

        // Verify that the count is updated in the UI
        expect(counterElement.textContent).toBe("5");

        // Update to another value
        board.selectedCount = 10;
        expect(counterElement.textContent).toBe("10");

        // Set to zero
        board.selectedCount = 0;
        expect(counterElement.textContent).toBe("0");
    });

    it("should handle counter element not found", () => {
        // Create a root element without a counter element
        const emptyRoot = document.createElement("div");
        document.body.appendChild(emptyRoot);

        // Mock console.warn to verify warning is logged
        const consoleWarnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        new MultiSelectionBackboard(emptyRoot);

        // Verify that warning was logged
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "No counter element found in backboard element"
        );

        // Clean up
        consoleWarnSpy.mockRestore();
    });

    it("should handle string selector for root element", () => {
        // Add an id to the root element so we can query it
        rootElement.id = "test-board";

        // Create a selector string
        const selector = "#test-board";

        // Update the mock implementation for this test
        mockGetElement.mockImplementation(() => rootElement);

        // Create board with string selector
        const board = new MultiSelectionBackboard(selector);

        // Verify the getElement was called with our selector
        expect(mockGetElement).toHaveBeenCalledWith(selector);

        // And that the board has the correct element
        expect(board.el).toBe(rootElement);
    });
});
