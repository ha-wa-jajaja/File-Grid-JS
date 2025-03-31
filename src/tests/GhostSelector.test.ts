/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GhostSelector from "../components/GhostSelector";
import FileGridContainer from "../components/GridContainer";

// Mock modules
const mockGhostSelectorUtils = {
    toggleFgGhostSelect: vi.fn(),
    updateFgGhostSelectFrame: vi.fn(),
    checkFgCollidedItems: vi.fn(),
    endFgGhostSelect: vi.fn(),
};

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

vi.mock("../../utils/ghostSelector", () => ({
    useFgGhostSelector: () => mockGhostSelectorUtils,
}));

describe("GhostSelector", () => {
    // Test elements
    let ghostElement: HTMLElement;
    let containerElement: HTMLElement;
    let mockContainer: FileGridContainer<string>;

    // Sample test data
    const testIds = ["item-1", "item-2", "item-3"];
    const itemClass = ".file-grid__item";

    // Mock event listeners
    const addEventListenerSpy = vi.fn();
    const removeEventListenerSpy = vi.fn();

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create DOM elements
        ghostElement = document.createElement("div");
        ghostElement.classList.add("file-grid__ghost-selector");
        containerElement = document.createElement("div");
        containerElement.classList.add("file-grid__container");

        // Create item elements within container
        testIds.forEach(() => {
            const itemEl = document.createElement("div");
            itemEl.classList.add("file-grid__item");
            containerElement.appendChild(itemEl);
        });

        // Add elements to document
        document.body.appendChild(ghostElement);
        document.body.appendChild(containerElement);

        // Mock container
        mockContainer = {
            el: containerElement,
            itemEls: Array.from(containerElement.querySelectorAll(itemClass)),
            allIds: testIds,
            selectedIds: new Set<string>(),
        } as unknown as FileGridContainer<string>;

        // Setup spies for event listeners
        const originalAddEventListener = window.addEventListener;
        const originalRemoveEventListener = window.removeEventListener;

        window.addEventListener = addEventListenerSpy;
        window.removeEventListener = removeEventListenerSpy;
        document.addEventListener = addEventListenerSpy;
        document.removeEventListener = removeEventListenerSpy;
        containerElement.addEventListener = addEventListenerSpy;
        containerElement.removeEventListener = removeEventListenerSpy;

        // Default mock returns for ghost selector utils
        mockGhostSelectorUtils.toggleFgGhostSelect.mockReturnValue({
            active: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        });
        mockGhostSelectorUtils.updateFgGhostSelectFrame.mockReturnValue({
            active: true,
            x: 100,
            y: 100,
            width: 200,
            height: 200,
        });
        mockGhostSelectorUtils.checkFgCollidedItems.mockReturnValue(
            new Set(["item-1"])
        );

        // Restore original event listeners after tests
        afterEach(() => {
            window.addEventListener = originalAddEventListener;
            window.removeEventListener = originalRemoveEventListener;
        });
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should initialize correctly with provided element", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        expect(selector).toBeDefined();
        // Check that event listeners were added
        expect(addEventListenerSpy).toHaveBeenCalled();
    });

    it("should create a new element when root is empty string", () => {
        const insertAdjacentElementSpy = vi.spyOn(
            containerElement,
            "insertAdjacentElement"
        );

        new GhostSelector("", {
            container: mockContainer,
            itemClass,
        });

        // Check that a new element was created and inserted
        expect(insertAdjacentElementSpy).toHaveBeenCalledWith(
            "afterbegin",
            expect.any(HTMLElement)
        );
        const newElement = insertAdjacentElementSpy.mock
            .calls[0][1] as HTMLElement;
        expect(newElement.classList.contains("file-grid__ghost-selector")).toBe(
            true
        );
    });

    it("should handle mousedown events on container", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the mousedown handler
        const mouseDownHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mousedown" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mousedown");

        // Call the handler if found
        if (mouseDownHandler) {
            mouseDownHandler(mockEvent);
        }

        // Check that toggleFgGhostSelect was called
        expect(mockGhostSelectorUtils.toggleFgGhostSelect).toHaveBeenCalledWith(
            true,
            mockEvent
        );
    });

    it("should handle mousemove events on document", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the mousemove handler
        const mouseMoveHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mousemove" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mousemove", {
            clientX: 150,
            clientY: 150,
        });

        // Call the handler if found
        if (mouseMoveHandler) {
            mouseMoveHandler(mockEvent);
        }

        // Check that updateFgGhostSelectFrame was called with correct coordinates
        expect(
            mockGhostSelectorUtils.updateFgGhostSelectFrame
        ).toHaveBeenCalledWith(150, 150);

        // Check that ghost selector style was updated
        expect(ghostElement.style.top).toBe("100px");
        expect(ghostElement.style.left).toBe("100px");
        expect(ghostElement.style.width).toBe("200px");
        expect(ghostElement.style.height).toBe("200px");

        // Check that checkFgCollidedItems was called
        expect(
            mockGhostSelectorUtils.checkFgCollidedItems
        ).toHaveBeenCalledWith(
            ghostElement,
            mockContainer.itemEls,
            mockContainer.allIds
        );

        // Check that container selectedIds was updated
        expect(mockContainer.selectedIds).toEqual(new Set(["item-1"]));
    });

    it("should handle mouseup events on document", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the mouseup handler
        const mouseUpHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mouseup" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mouseup");

        // Call the handler if found
        if (mouseUpHandler) {
            mouseUpHandler(mockEvent);
        }

        // Check that toggleFgGhostSelect was called with false
        expect(mockGhostSelectorUtils.toggleFgGhostSelect).toHaveBeenCalledWith(
            false,
            mockEvent
        );

        // Check that ghost selector style was updated to match the returned dims
        expect(ghostElement.style.top).toBe("0px");
        expect(ghostElement.style.left).toBe("0px");
        expect(ghostElement.style.width).toBe("0px");
        expect(ghostElement.style.height).toBe("0px");
    });

    it("should handle click events on window", () => {
        // Set up private property access helper
        const setPrivateProperty = (
            obj: object,
            prop: string,
            value: boolean
        ) => {
            Object.defineProperty(obj, `_${prop}`, { value, writable: true });
        };

        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Set active state to true
        setPrivateProperty(selector, "active", true);

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("click");
        const stopPropagationSpy = vi.spyOn(mockEvent, "stopPropagation");

        // Call the handler if found
        if (clickHandler) {
            clickHandler(mockEvent);
        }

        // Check that stopPropagation was called
        expect(stopPropagationSpy).toHaveBeenCalled();

        // Check that endFgGhostSelect was called
        expect(mockGhostSelectorUtils.endFgGhostSelect).toHaveBeenCalled();
    });

    it("should clear selection when clicking outside items", () => {
        const updateSelectionModelSpy = vi.fn();
        mockContainer.updateSelectionModel = updateSelectionModelSpy;

        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("click");
        Object.defineProperty(mockEvent, "target", {
            value: document.createElement("div"),
        });

        // Call the handler if found
        if (clickHandler) {
            clickHandler(mockEvent);
        }

        // Check that updateSelectionModel was called with "clear"
        expect(updateSelectionModelSpy).toHaveBeenCalledWith("clear");
    });

    it("should not clear selection when clicking on an item", () => {
        const updateSelectionModelSpy = vi.fn();
        mockContainer.updateSelectionModel = updateSelectionModelSpy;

        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click" && call[1] instanceof Function
        )?.[1];

        // Create a mock item element as the target
        const itemElement = document.createElement("div");
        itemElement.classList.add("file-grid__item");

        // Create mock event
        const mockEvent = new MouseEvent("click");
        Object.defineProperty(mockEvent, "target", { value: itemElement });

        // Call the handler if found
        if (clickHandler) {
            clickHandler(mockEvent);
        }

        // Check that updateSelectionModel was not called
        expect(updateSelectionModelSpy).not.toHaveBeenCalled();
    });

    it("should remove event listeners when destroyed", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Spy on removeEventListener
        const containerRemoveEventListenerSpy = vi.spyOn(
            mockContainer.el,
            "removeEventListener"
        );
        const documentRemoveEventListenerSpy = vi.spyOn(
            document,
            "removeEventListener"
        );
        const windowRemoveEventListenerSpy = vi.spyOn(
            window,
            "removeEventListener"
        );

        // Destroy the selector
        selector.destroy();

        // Check that event listeners were removed
        expect(containerRemoveEventListenerSpy).toHaveBeenCalledWith(
            "mousedown",
            expect.any(Function)
        );
        expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith(
            "mousemove",
            expect.any(Function)
        );
        expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith(
            "mouseup",
            expect.any(Function)
        );
        expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
            "click",
            expect.any(Function)
        );
    });

    it("should handle mousemove when ghost selection is not active", () => {
        // Create the selector
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Mock updateFgGhostSelectFrame to return null/undefined (which represents that ghost select is not active)
        mockGhostSelectorUtils.updateFgGhostSelectFrame.mockReturnValueOnce(
            null
        );

        // Get the mousemove handler
        const mouseMoveHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "mousemove" && call[1] instanceof Function
        )?.[1];

        // Create mock event
        const mockEvent = new MouseEvent("mousemove", {
            clientX: 150,
            clientY: 150,
        });

        // Create spies to verify what's not called
        const checkFgCollidedItemsSpy = vi.spyOn(
            mockGhostSelectorUtils,
            "checkFgCollidedItems"
        );

        // Reset the spy to verify it's not called in this test
        checkFgCollidedItemsSpy.mockClear();

        // Call the handler if found
        if (mouseMoveHandler) {
            mouseMoveHandler(mockEvent);
        }

        // Check that updateFgGhostSelectFrame was called with correct coordinates
        expect(
            mockGhostSelectorUtils.updateFgGhostSelectFrame
        ).toHaveBeenCalledWith(150, 150);

        // Check that checkFgCollidedItems was NOT called since dims is falsy
        expect(checkFgCollidedItemsSpy).not.toHaveBeenCalled();

        // Ghost selector style should not be updated
        expect(ghostElement.style.top).not.toBe("100px");
        expect(ghostElement.style.left).not.toBe("100px");
        expect(ghostElement.style.width).not.toBe("200px");
        expect(ghostElement.style.height).not.toBe("200px");
    });

    it("should handle click events with invalid targets", () => {
        const selector = new GhostSelector(ghostElement, {
            container: mockContainer,
            itemClass,
        });

        // Get the click handler
        const clickHandler = addEventListenerSpy.mock.calls.find(
            (call) => call[0] === "click" && call[1] instanceof Function
        )?.[1];

        // Create mock event with missing target
        const mockEventNoTarget = new MouseEvent("click");
        // Remove target property
        Object.defineProperty(mockEventNoTarget, "target", {
            value: null,
        });

        // Spy on updateSelectionModel to verify it's not called
        const updateSelectionModelSpy = vi.fn();
        mockContainer.updateSelectionModel = updateSelectionModelSpy;

        // Call the handler with no target
        if (clickHandler) {
            clickHandler(mockEventNoTarget);
        }

        // Check that updateSelectionModel was not called
        expect(updateSelectionModelSpy).not.toHaveBeenCalled();

        // Now create an event with a target that doesn't have classList
        const mockEventNoClassList = new MouseEvent("click");
        Object.defineProperty(mockEventNoClassList, "target", {
            value: {
                /* target without classList property */
            },
        });

        // Reset the spy
        updateSelectionModelSpy.mockClear();

        // Call the handler with a target missing classList
        if (clickHandler) {
            clickHandler(mockEventNoClassList);
        }

        // Check that updateSelectionModel was not called again
        expect(updateSelectionModelSpy).not.toHaveBeenCalled();
    });
});
