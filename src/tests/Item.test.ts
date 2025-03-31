/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import FileGridItem from "../components/Item";
import FileGridFileUploader from "../components/FileUploader";
import FileGridContainer from "../components/GridContainer";
import MultiSelectionBackboard from "../components/MultiSelectionBoard";

// Mock modules
const mockItemActions = {
    onFgItemMouseDown: vi.fn(),
    onFgItemClick: vi.fn(),
    onFgItemDragStart: vi.fn(),
    onFgItemDragEnd: vi.fn(),
};

vi.mock("../../utils", () => ({
    utils: () => ({
        getElement: vi.fn((el) => {
            if (el instanceof HTMLElement) return el;
            return document.querySelector(el) || document.createElement("div");
        }),
    }),
}));

vi.mock("../../utils/itemActions", () => ({
    useFgItemActions: () => mockItemActions,
}));

describe("FileGridItem", () => {
    // Test elements
    let itemElement: HTMLElement;
    let mockUploader: FileGridFileUploader;
    let mockContainer: FileGridContainer<string>;
    let mockMultiBoard: MultiSelectionBackboard;

    // Test id
    const testId = "test-item-1";

    // Mock event listeners
    const addEventListenerSpy = vi.fn();
    const removeEventListenerSpy = vi.fn();

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create DOM elements
        itemElement = document.createElement("div");
        itemElement.classList.add("file-grid__item");

        // Setup spies for event listeners
        itemElement.addEventListener = addEventListenerSpy;
        itemElement.removeEventListener = removeEventListenerSpy;

        // Add element to document
        document.body.appendChild(itemElement);

        // Setup mock objects
        mockUploader = {
            isInternalDragging: false,
        } as unknown as FileGridFileUploader;

        mockContainer = {
            updateSelectionModel: vi.fn(),
            selectedIds: new Set<string>(),
        } as unknown as FileGridContainer<string>;

        mockMultiBoard = {
            el: document.createElement("div"),
        } as unknown as MultiSelectionBackboard;

        // Default mock returns for item actions
        mockItemActions.onFgItemMouseDown.mockReturnValue("select");
        mockItemActions.onFgItemClick.mockReturnValue("select");
        mockItemActions.onFgItemDragStart.mockReturnValue({ dragging: true });
        mockItemActions.onFgItemDragEnd.mockReturnValue({ dragging: false });
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should initialize correctly", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
            selectedClass: "item-selected",
        });

        // Check that event listeners were added
        expect(addEventListenerSpy).toHaveBeenCalledTimes(4);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "mousedown",
            expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "click",
            expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "dragstart",
            expect.any(Function)
        );
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "dragend",
            expect.any(Function)
        );

        // Check that el getter works
        expect(item.el).toBe(itemElement);
    });

    it("should handle mousedown events", () => {
        // Set up the FileGridItem with _selected explicitly defined as false
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Explicitly set the _selected property to false
        Object.defineProperty(item, "_selected", { value: false });

        // Get the mousedown handler that was registered
        const mouseDownHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mousedown"
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mousedown");

        // Call the handler
        mouseDownHandler(mockEvent);

        // Check that item actions and container methods were called
        expect(mockItemActions.onFgItemMouseDown).toHaveBeenCalledWith(
            mockEvent,
            false
        );
        expect(mockContainer.updateSelectionModel).toHaveBeenCalledWith(
            "select",
            testId
        );
    });

    it("should not update selection when mousedown returns null", () => {
        mockItemActions.onFgItemMouseDown.mockReturnValueOnce(null);

        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the mousedown handler
        const mouseDownHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mousedown"
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mousedown");

        // Call the handler
        mouseDownHandler(mockEvent);

        // Check that container's updateSelectionModel was not called
        expect(mockContainer.updateSelectionModel).not.toHaveBeenCalled();
    });

    it("should handle click events", () => {
        new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click"
        )?.[1];

        // Call the handler
        clickHandler();

        // Check that item actions and container methods were called
        expect(mockItemActions.onFgItemClick).toHaveBeenCalled();
        expect(mockContainer.updateSelectionModel).toHaveBeenCalledWith(
            "select",
            testId
        );
    });

    it("should not update selection when click returns null", () => {
        mockItemActions.onFgItemClick.mockReturnValueOnce(null);

        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click"
        )?.[1];

        // Call the handler
        clickHandler();

        // Check that container's updateSelectionModel was not called
        expect(mockContainer.updateSelectionModel).not.toHaveBeenCalled();
    });

    it("should handle dragstart events", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the dragstart handler
        const dragStartHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "dragstart"
        )?.[1];

        // Create a mock event object instead of using DragEvent constructor
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            stopImmediatePropagation: vi.fn(),
            dataTransfer: {
                setDragImage: vi.fn(),
            },
        } as unknown as DragEvent;

        // Call the handler
        dragStartHandler(mockEvent);

        // Check that item actions were called
        expect(mockItemActions.onFgItemDragStart).toHaveBeenCalledWith(
            mockEvent,
            mockContainer.selectedIds,
            mockMultiBoard.el
        );

        // Check that uploader state was updated
        expect(mockUploader.isInternalDragging).toBe(true);
    });

    it("should set custom drag image when multiple items are selected", () => {
        // Set up container with multiple selected items
        mockContainer.selectedIds = new Set(["item-1", "item-2"]);

        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the dragstart handler
        const dragStartHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "dragstart"
        )?.[1];

        // Create mock event with dataTransfer that has setDragImage method
        const mockDataTransfer = {
            setDragImage: vi.fn(),
        };

        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            stopImmediatePropagation: vi.fn(),
            dataTransfer: mockDataTransfer,
        } as unknown as DragEvent;

        // Call the handler
        dragStartHandler(mockEvent);

        // Function should be called with multi selection board
        expect(mockItemActions.onFgItemDragStart).toHaveBeenCalledWith(
            mockEvent,
            mockContainer.selectedIds,
            mockMultiBoard.el
        );
    });

    it("should handle dragend events", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get the dragend handler
        const dragEndHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "dragend"
        )?.[1];

        // Call the handler
        dragEndHandler();

        // Check that item actions were called and uploader state was updated
        expect(mockItemActions.onFgItemDragEnd).toHaveBeenCalled();
        expect(mockUploader.isInternalDragging).toBe(false);
    });

    it("should handle dragstart and dragend without uploader", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: null,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Get handlers
        const dragStartHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "dragstart"
        )?.[1];

        const dragEndHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "dragend"
        )?.[1];

        // Create mock event object
        const mockEvent = {
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            stopImmediatePropagation: vi.fn(),
            dataTransfer: {
                setDragImage: vi.fn(),
            },
        } as unknown as DragEvent;

        // Call handlers - should not throw errors even with null uploader
        expect(() => dragStartHandler(mockEvent)).not.toThrow();
        expect(() => dragEndHandler()).not.toThrow();

        // Check that item actions were still called
        expect(mockItemActions.onFgItemDragStart).toHaveBeenCalled();
        expect(mockItemActions.onFgItemDragEnd).toHaveBeenCalled();
    });

    it("should toggle selection state correctly", () => {
        const selectedClass = "item-selected";

        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
            selectedClass,
        });

        // Initially, the element should not have the selected class
        expect(itemElement.classList.contains(selectedClass)).toBe(false);

        // Toggle selection on
        item.toggleSelect(true);
        expect(itemElement.classList.contains(selectedClass)).toBe(true);

        // Toggle selection off
        item.toggleSelect(false);
        expect(itemElement.classList.contains(selectedClass)).toBe(false);
    });

    it("should use default 'selected' class if none provided", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
            // No selectedClass provided
        });

        // Toggle selection on
        item.toggleSelect(true);
        expect(itemElement.classList.contains("selected")).toBe(true);
    });

    it("should remove event listeners when destroyed", () => {
        const item = new FileGridItem(itemElement, {
            id: testId,
            uploader: mockUploader,
            container: mockContainer,
            multiItemBoard: mockMultiBoard,
        });

        // Destroy the item
        item.destroy();

        // Should have called removeEventListener for each event
        expect(removeEventListenerSpy).toHaveBeenCalledTimes(4);
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "mousedown",
            expect.any(Function)
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "click",
            expect.any(Function)
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "dragstart",
            expect.any(Function)
        );
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "dragend",
            expect.any(Function)
        );
    });
});
