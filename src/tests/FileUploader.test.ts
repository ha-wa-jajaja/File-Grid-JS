import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import FileGridFileUploader, {
    DropFilesCallback,
} from "../components/FileUploader";

// Instead of mocking the modules, let's create manual mocks
// and inject them directly into the FileUploader constructor
const mockUtils = {
    getElement: vi.fn((selector) => {
        // If it's already an element, return it
        if (selector instanceof HTMLElement) return selector;

        // For string selectors, we'll handle known ones in the test setup
        return null; // This will be overridden in the tests
    }),
    clamp: vi.fn((value, min, max) => Math.min(Math.max(value, min), max)),
};

const mockUploaderUtils = {
    dragOverAction: vi.fn(
        ({ isDragging, isInternalDragging, isUploadDisabled }) => ({
            showDropUploadBoard:
                isDragging && !isInternalDragging && !isUploadDisabled,
        })
    ),
    extractDroppedFiles: vi.fn(() => ({
        files: [{ name: "test-file.txt" }] as unknown as FileSystemFileEntry[],
        folders: [] as FileSystemDirectoryEntry[],
    })),
};

// Mock the module imports to return our controlled mock objects
vi.mock("../../utils", () => ({
    utils: () => mockUtils,
}));

vi.mock("../../utils/uploader", () => ({
    uploaderUtils: () => mockUploaderUtils,
}));

describe("FileGridFileUploader", () => {
    let rootElement: HTMLElement;
    let backboardElement: HTMLElement;
    let contentElement: HTMLElement;
    let mockDroppedFilesEvent: DropFilesCallback;

    beforeEach(() => {
        // Setup DOM elements
        rootElement = document.createElement("div");
        backboardElement = document.createElement("div");
        backboardElement.classList.add("file-grid__file-uploader-backboard");
        contentElement = document.createElement("div");
        contentElement.classList.add("file-grid__file-uploader-content");

        document.body.appendChild(rootElement);
        document.body.appendChild(backboardElement);
        document.body.appendChild(contentElement);

        // Setup mock for dropped files event
        mockDroppedFilesEvent = vi.fn();

        // Reset mock implementations for each test
        vi.resetAllMocks();

        // Setup mockUtils.getElement to return our test elements
        mockUtils.getElement.mockImplementation((selector) => {
            if (selector instanceof HTMLElement) return selector;

            if (typeof selector === "string") {
                if (selector.includes("backboard")) return backboardElement;
                if (selector.includes("content")) return contentElement;

                // For other string selectors, create a new element
                const el = document.createElement("div");
                el.classList.add(selector.replace(".", ""));
                return el;
            }

            return selector;
        });
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should initialize correctly", () => {
        const uploader = new FileGridFileUploader(rootElement, {
            uploadBackBoardElement: backboardElement,
            contentAreaElement: contentElement,
            droppedFilesEvent: mockDroppedFilesEvent,
        });

        expect(uploader).toBeDefined();
        expect(rootElement.classList.contains("file-grid__file-uploader")).toBe(
            true
        );
        expect(backboardElement.style.display).toBe("none");
    });

    it("should set disabledUpload property correctly", () => {
        const uploader = new FileGridFileUploader(rootElement);

        expect(uploader.disabledUpload).toBe(false);

        uploader.disabledUpload = true;
        expect(uploader.disabledUpload).toBe(true);
    });

    it("should set isInternalDragging property correctly", () => {
        const uploader = new FileGridFileUploader(rootElement);

        expect(uploader.isInternalDragging).toBe(false);

        uploader.isInternalDragging = true;
        expect(uploader.isInternalDragging).toBe(true);
    });

    it("should handle dragenter event", () => {
        // Configure mock to return true for showDropUploadBoard
        mockUploaderUtils.dragOverAction.mockReturnValue({
            showDropUploadBoard: true,
        });

        new FileGridFileUploader(rootElement, {
            uploadBackBoardElement: backboardElement,
            contentAreaElement: contentElement,
        });

        const dragEnterEvent = new Event("dragenter", { bubbles: true });
        rootElement.dispatchEvent(dragEnterEvent);

        // Check that dragOverAction was called
        expect(mockUploaderUtils.dragOverAction).toHaveBeenCalledWith(
            expect.objectContaining({
                event: dragEnterEvent,
                isDragging: true,
                isInternalDragging: false,
                isUploadDisabled: false,
            })
        );

        // The showDropUploadBoard should be true for a dragenter event
        expect(backboardElement.style.display).toBe("block");
        expect(
            contentElement.classList.contains("file-grid__content-hide")
        ).toBe(true);
    });

    it("should handle dragleave event", () => {
        new FileGridFileUploader(rootElement, {
            uploadBackBoardElement: backboardElement,
            contentAreaElement: contentElement,
        });

        // First call for dragenter - show board
        mockUploaderUtils.dragOverAction.mockReturnValueOnce({
            showDropUploadBoard: true,
        });

        // Trigger dragenter
        const dragEnterEvent = new Event("dragenter", { bubbles: true });
        rootElement.dispatchEvent(dragEnterEvent);

        // Board should be visible
        expect(backboardElement.style.display).toBe("block");

        // Second call for dragleave - hide board
        mockUploaderUtils.dragOverAction.mockReturnValueOnce({
            showDropUploadBoard: false,
        });

        // Trigger dragleave
        const dragLeaveEvent = new Event("dragleave", { bubbles: true });
        rootElement.dispatchEvent(dragLeaveEvent);

        // The mock should have been called twice
        expect(mockUploaderUtils.dragOverAction).toHaveBeenCalledTimes(2);

        // Board should be hidden
        expect(backboardElement.style.display).toBe("none");
        expect(
            contentElement.classList.contains("file-grid__content-hide")
        ).toBe(false);
    });

    it("should prevent default on dragover", () => {
        new FileGridFileUploader(rootElement);

        const dragOverEvent = new Event("dragover");
        const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");

        rootElement.dispatchEvent(dragOverEvent);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should handle drop event and call onDroppedFiles", () => {
        const mockFiles = [
            { name: "test-file.txt" },
        ] as unknown as FileSystemFileEntry[];
        const mockFolders = [] as FileSystemDirectoryEntry[];

        mockUploaderUtils.extractDroppedFiles.mockReturnValue({
            files: mockFiles,
            folders: mockFolders,
        });

        new FileGridFileUploader(rootElement, {
            uploadBackBoardElement: backboardElement,
            contentAreaElement: contentElement,
            droppedFilesEvent: mockDroppedFilesEvent,
        });

        const dropEvent = new Event("drop") as unknown as DragEvent;
        rootElement.dispatchEvent(dropEvent);

        // Check the mock was called with the right arguments
        expect(mockUploaderUtils.extractDroppedFiles).toHaveBeenCalledWith(
            dropEvent,
            false
        );

        // Check that our callback was called with the files and folders
        expect(mockDroppedFilesEvent).toHaveBeenCalledWith(
            mockFiles,
            mockFolders
        );

        // The upload board should be hidden after drop
        expect(backboardElement.style.display).toBe("none");
        expect(
            contentElement.classList.contains("file-grid__content-hide")
        ).toBe(false);
    });

    it("should not process events when upload is disabled", () => {
        const uploader = new FileGridFileUploader(rootElement, {
            droppedFilesEvent: mockDroppedFilesEvent,
        });

        // Disable upload
        uploader.disabledUpload = true;

        // Try drag events
        const dragEnterEvent = new Event("dragenter");
        rootElement.dispatchEvent(dragEnterEvent);

        // dragOverAction should not be called
        expect(mockUploaderUtils.dragOverAction).not.toHaveBeenCalled();

        // Try drop event
        const dropEvent = new Event("drop") as unknown as DragEvent;
        rootElement.dispatchEvent(dropEvent);

        // extractDroppedFiles should not be called
        expect(mockUploaderUtils.extractDroppedFiles).not.toHaveBeenCalled();
        expect(mockDroppedFilesEvent).not.toHaveBeenCalled();
    });

    it("should handle promise rejection in droppedFilesEvent", async () => {
        // Setup fake timers
        vi.useFakeTimers();

        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const errorMessage = "Test error";

        const mockPromiseDroppedFilesEvent: DropFilesCallback = () => {
            return Promise.reject(new Error(errorMessage));
        };

        new FileGridFileUploader(rootElement, {
            droppedFilesEvent: mockPromiseDroppedFilesEvent,
        });

        const dropEvent = new Event("drop") as unknown as DragEvent;
        rootElement.dispatchEvent(dropEvent);

        // Wait for promises to resolve/reject
        await vi.runAllTimers();

        expect(consoleSpy).toHaveBeenCalledWith(
            "Error in droppedFilesEvent:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
        vi.useRealTimers();
    });

    it("should handle constructor errors gracefully", () => {
        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        // Make getElement throw an error
        mockUtils.getElement.mockImplementationOnce(() => {
            throw new Error("Test error");
        });

        new FileGridFileUploader(rootElement);

        expect(consoleSpy).toHaveBeenCalledWith(
            "Error when setup FileUploader: ",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });
});
