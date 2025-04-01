/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import FileGrid from "../components/FileGrid";
import FileGridFileUploader from "../components/FileUploader";
import AutoScrollSensor from "../components/AutoScrollSensor";
import FileGridContainer from "../components/GridContainer";

// Mock the imported components
vi.mock("../components/FileUploader", () => ({
    default: vi.fn(),
}));

vi.mock("../components/AutoScrollSensor", () => ({
    default: vi.fn(),
}));

vi.mock("../components/GridContainer", () => ({
    default: vi.fn(),
}));

// Mock utils
vi.mock("../../utils", () => ({
    utils: () => ({
        getElement: vi.fn((el) => {
            if (el instanceof HTMLElement) return el;
            if (typeof el === "string") {
                return (
                    document.querySelector(el) || document.createElement("div")
                );
            }
            return el;
        }),
    }),
}));

describe("FileGrid", () => {
    let rootElement: HTMLElement;
    let mockUploader: ReturnType<typeof vi.fn>;
    let mockScrollSensor: ReturnType<typeof vi.fn>;
    let mockContainer: ReturnType<typeof vi.fn>;

    // Sample test data
    const testIds = ["item-1", "item-2", "item-3"];

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create DOM elements
        rootElement = document.createElement("div");
        document.body.appendChild(rootElement);

        // Mock component constructors
        (
            FileGridFileUploader as unknown as ReturnType<typeof vi.fn>
        ).mockImplementation(() => ({
            disabledUpload: false,
        }));

        (
            AutoScrollSensor as unknown as ReturnType<typeof vi.fn>
        ).mockImplementation(() => ({}));

        (
            FileGridContainer as unknown as ReturnType<typeof vi.fn>
        ).mockImplementation(() => ({
            allIds: [...testIds],
            selectedIds: new Set(),
        }));

        // Create references to mock constructors for later assertions
        mockUploader = FileGridFileUploader as unknown as ReturnType<
            typeof vi.fn
        >;
        mockScrollSensor = AutoScrollSensor as unknown as ReturnType<
            typeof vi.fn
        >;
        mockContainer = FileGridContainer as unknown as ReturnType<
            typeof vi.fn
        >;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should initialize correctly with default options", () => {
        const grid = new FileGrid(rootElement, {
            allIds: testIds,
        });

        // Check that the file-grid class was added to the root element
        expect(rootElement.classList.contains("file-grid")).toBe(true);

        // Check that FileGridFileUploader was initialized
        expect(mockUploader).toHaveBeenCalled();

        // Check that AutoScrollSensor was initialized
        expect(mockScrollSensor).toHaveBeenCalled();

        // Check that FileGridContainer was initialized with correct options
        expect(mockContainer).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                allIds: testIds,
            })
        );
    });

    it("should initialize with custom options", () => {
        const customOptions = {
            allIds: testIds,
            uploader: "#custom-uploader",
            scrollSensor: "#custom-scroller",
            container: "#custom-container",
            item: {
                el: "#custom-item",
                selectedClassName: "custom-selected",
            },
            multiBoard: "#custom-multi-board",
            ghostSelector: "#custom-ghost",
            autoScrollConfig: {
                scrollThreshold: 0.3,
                scrollSpeed: 7,
            },
            droppedFilesEvent: vi.fn(),
        };

        new FileGrid(rootElement, customOptions);

        // Check that FileGridFileUploader was initialized with custom options
        expect(mockUploader).toHaveBeenCalledWith(
            customOptions.uploader,
            expect.objectContaining({
                droppedFilesEvent: customOptions.droppedFilesEvent,
            })
        );

        // Check that AutoScrollSensor was initialized with custom options
        expect(mockScrollSensor).toHaveBeenCalledWith(
            customOptions.scrollSensor,
            customOptions.autoScrollConfig
        );

        // Check that FileGridContainer was initialized with custom options
        expect(mockContainer).toHaveBeenCalledWith(
            customOptions.container,
            expect.objectContaining({
                allIds: customOptions.allIds,
                itemClass: customOptions.item.el,
                itemSelectedClassName: customOptions.item.selectedClassName,
                multiBoard: customOptions.multiBoard,
                ghostSelector: customOptions.ghostSelector,
            })
        );
    });

    it("should log a warning if no ids are provided", () => {
        // Spy on console.warn
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        new FileGrid(rootElement, {
            allIds: [],
        });

        // Verify warning was logged
        expect(warnSpy).toHaveBeenCalledWith("No ids are passed into FileGrid");

        // Restore console.warn
        warnSpy.mockRestore();
    });

    it("should disable uploader when disableUpload is called", () => {
        // Create a mock uploader with a property we can verify
        const mockUploaderInstance = {
            disabledUpload: false,
        };

        (
            FileGridFileUploader as unknown as ReturnType<typeof vi.fn>
        ).mockImplementationOnce(() => mockUploaderInstance);

        const grid = new FileGrid(rootElement, {
            allIds: testIds,
        });

        // Call disableUpload
        grid.disableUpload(true);

        // Verify the uploader's disabledUpload property was updated
        expect(mockUploaderInstance.disabledUpload).toBe(true);
    });

    it("should not attempt to disable uploader if it doesn't exist", () => {
        // Create a grid without an uploader
        const grid = new FileGrid(rootElement, {
            allIds: testIds,
            uploader: null,
        });

        // This should not throw an error
        expect(() => grid.disableUpload(true)).not.toThrow();

        // Verify FileGridFileUploader was not called
        expect(mockUploader).not.toHaveBeenCalled();
    });

    it("should handle setting allIds", () => {
        // Create a mock container with a property we can verify
        const mockContainerInstance = {
            allIds: [...testIds],
        };

        (
            FileGridContainer as unknown as ReturnType<typeof vi.fn>
        ).mockImplementationOnce(() => mockContainerInstance);

        const grid = new FileGrid(rootElement, {
            allIds: testIds,
        });

        // Set new IDs
        const newIds = ["new-1", "new-2", "new-3"];
        grid.allIds = newIds;

        // Verify the container's allIds property was updated
        expect(mockContainerInstance.allIds).toEqual(newIds);
    });

    it("should expose selectedIds getter", () => {
        // Create a mock container with a property we can verify
        const selectedIds = new Set(["item-1", "item-3"]);
        const mockContainerInstance = {
            selectedIds,
        };

        (
            FileGridContainer as unknown as ReturnType<typeof vi.fn>
        ).mockImplementationOnce(() => mockContainerInstance);

        const grid = new FileGrid(rootElement, {
            allIds: testIds,
        });

        // Verify that the selectedIds getter returns the container's selectedIds
        expect(grid.selectedIds).toBe(selectedIds);
    });

    it("should initialize without uploader when uploader option is null", () => {
        new FileGrid(rootElement, {
            allIds: testIds,
            uploader: null,
        });

        // FileGridFileUploader should not be called
        expect(mockUploader).not.toHaveBeenCalled();
    });
});
