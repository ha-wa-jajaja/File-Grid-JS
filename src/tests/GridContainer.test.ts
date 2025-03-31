/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import FileGridContainer from "../components/GridContainer";
import FileGridFileUploader from "../components/FileUploader";
import FileGridItem from "../components/Item";
import GhostSelector from "../components/GhostSelector";
import MultiSelectionBackboard from "../components/MultiSelectionBoard";
import AutoScrollSensor from "../components/AutoScrollSensor";

// Mock modules and components
vi.mock("../components/MultiSelectionBoard", () => ({
    default: vi.fn(),
}));

vi.mock("../components/GhostSelector", () => ({
    default: vi.fn(),
}));

vi.mock("../components/Item", () => ({
    default: vi.fn(),
}));

// Mock selection utility
const mockGetUpdatedIdModel = vi.fn();
vi.mock("../../utils/selection", () => ({
    useFgSelection: () => ({
        getUpdatedIdModel: mockGetUpdatedIdModel,
    }),
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

describe("FileGridContainer", () => {
    // Test elements
    let containerElement: HTMLElement;
    let mockUploader: FileGridFileUploader;
    let mockScrollSensor: AutoScrollSensor;

    // Sample test data
    const testIds = ["item-1", "item-2", "item-3"];

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create DOM elements
        containerElement = document.createElement("div");
        containerElement.classList.add("file-grid__container");
        document.body.appendChild(containerElement);

        // Create item elements
        testIds.forEach((id) => {
            const itemEl = document.createElement("div");
            itemEl.classList.add("file-grid__item");
            containerElement.appendChild(itemEl);
        });

        // Setup mock uploader
        mockUploader = {
            isInternalDragging: false,
            disabledUpload: false,
        } as unknown as FileGridFileUploader;

        // Setup mock scrollSensor
        mockScrollSensor = {} as unknown as AutoScrollSensor;

        // Setup MultiSelectionBackboard mock implementation
        (MultiSelectionBackboard as unknown as Mock).mockImplementation(() => ({
            selectedCount: 0,
            el: document.createElement("div"),
        }));

        // Setup GhostSelector mock implementation
        (GhostSelector as unknown as Mock).mockImplementation(() => ({}));

        // Setup FileGridItem mock implementation
        (FileGridItem as unknown as Mock).mockImplementation((el) => ({
            el,
            toggleSelect: vi.fn(),
        }));

        // Setup default mock returns for getUpdatedIdModel
        mockGetUpdatedIdModel.mockImplementation(
            ({ selectedIds }) => selectedIds
        );
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should initialize correctly with default options", () => {
        const container = new FileGridContainer(containerElement);

        // Check that the container was assigned the class
        expect(
            containerElement.classList.contains("file-grid__container")
        ).toBe(true);

        // Check that MultiSelectionBackboard was initialized
        expect(MultiSelectionBackboard).toHaveBeenCalled();

        // Check that GhostSelector was initialized
        expect(GhostSelector).toHaveBeenCalled();

        // Check that FileGridItem was initialized for each item
        expect(FileGridItem).toHaveBeenCalledTimes(testIds.length);
    });

    it("should initialize with custom options", () => {
        const itemClass = ".custom-item";
        const itemSelectedClassName = "custom-selected";
        const multiBoardSelector = ".custom-multi-board";

        // Setup test DOM with custom classes
        const customItemEls = testIds.map(() => {
            const el = document.createElement("div");
            el.classList.add("custom-item");
            containerElement.appendChild(el);
            return el;
        });

        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
            itemClass,
            itemSelectedClassName,
            uploader: mockUploader,
            scrollSensor: mockScrollSensor,
            multiBoard: multiBoardSelector,
            ghostSelector: null,
        });

        // Check that MultiSelectionBackboard was initialized with the custom selector
        expect(MultiSelectionBackboard).toHaveBeenCalledWith(
            multiBoardSelector
        );

        // The GhostSelector should be created with a generated element when ghostSelector is null
        expect(GhostSelector).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining({
                container: container,
                itemClass: itemClass,
            })
        );
    });

    it("should set selectedIds and update item selections", () => {
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Access the mock item instances
        const mockItems = (FileGridItem as unknown as Mock).mock.results.map(
            (result) => result.value
        );

        // Create a new selection set
        const selectedIdSet = new Set(["item-1", "item-3"]);

        // Set the selectedIds
        container.selectedIds = selectedIdSet;

        // Check that toggleSelect was called correctly for each item
        expect(mockItems[0].toggleSelect).toHaveBeenCalledWith(true);
        expect(mockItems[1].toggleSelect).toHaveBeenCalledWith(false);
        expect(mockItems[2].toggleSelect).toHaveBeenCalledWith(true);

        // Check that MultiSelectionBackboard was updated
        const mockMultiBoard = (MultiSelectionBackboard as unknown as Mock).mock
            .results[0].value;
        expect(mockMultiBoard.selectedCount).toBe(2);
    });

    it("should update allIds and refresh item elements", () => {
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Clear mock calls from initialization
        (FileGridItem as unknown as Mock).mockClear();

        // Now update with new IDs
        const newIds = ["new-1", "new-2", "new-3"];
        container.allIds = newIds;

        // Should create new FileGridItem instances
        expect(FileGridItem).toHaveBeenCalledTimes(newIds.length);

        // Check that internal _allIds is updated
        expect(container.allIds).toEqual(newIds);
    });

    it("should update selection model correctly", () => {
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Setup mock return value for selection update
        const updatedSelection = new Set(["item-2"]);
        mockGetUpdatedIdModel.mockReturnValueOnce(updatedSelection);

        // Call updateSelectionModel
        container.updateSelectionModel("select", "item-2");

        // Check that getUpdatedIdModel was called with correct params
        expect(mockGetUpdatedIdModel).toHaveBeenCalledWith({
            action: "select",
            targetId: "item-2",
            allIds: testIds,
            selectedIds: expect.any(Set),
        });

        // Get mock items
        const mockItems = (FileGridItem as unknown as Mock).mock.results.map(
            (result) => result.value
        );

        // Should update the item selections based on the returned set
        expect(mockItems[0].toggleSelect).toHaveBeenCalledWith(false);
        expect(mockItems[1].toggleSelect).toHaveBeenCalledWith(true);
        expect(mockItems[2].toggleSelect).toHaveBeenCalledWith(false);
    });

    it("should not update selection model when action is null", () => {
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Clear the mock calls from initialization
        mockGetUpdatedIdModel.mockClear();

        // Call updateSelectionModel with null action
        container.updateSelectionModel(null as any, "item-2");

        // getUpdatedIdModel should not be called
        expect(mockGetUpdatedIdModel).not.toHaveBeenCalled();
    });

    it("should handle clear action for selection model", () => {
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Setup initial selection
        container.selectedIds = new Set(["item-1", "item-2"]);

        // Setup mock to return empty set for clear action
        mockGetUpdatedIdModel.mockReturnValueOnce(new Set());

        // Call updateSelectionModel with clear action
        container.updateSelectionModel("clear");

        // Check that getUpdatedIdModel was called with correct params
        expect(mockGetUpdatedIdModel).toHaveBeenCalledWith({
            action: "clear",
            targetId: undefined,
            allIds: testIds,
            selectedIds: expect.any(Set),
        });

        // Get mock items
        const mockItems = (FileGridItem as unknown as Mock).mock.results.map(
            (result) => result.value
        );

        // All items should be deselected
        mockItems.forEach((item) => {
            expect(item.toggleSelect).toHaveBeenCalledWith(false);
        });

        // MultiSelectionBackboard count should be 0
        const mockMultiBoard = (MultiSelectionBackboard as unknown as Mock).mock
            .results[0].value;
        expect(mockMultiBoard.selectedCount).toBe(0);
    });

    it("should create ghost selector element when ghostSelector is null", () => {
        // Spy on appendChild
        const appendChildSpy = vi.spyOn(containerElement, "appendChild");

        new FileGridContainer(containerElement, {
            allIds: testIds,
            ghostSelector: null,
        });

        // Should create a new element and call appendChild
        expect(appendChildSpy).toHaveBeenCalledWith(expect.any(HTMLElement));

        // The new element should have the ghost selector class
        const createdEl = appendChildSpy.mock.calls[0][0] as HTMLElement;
        expect(createdEl.classList.contains("file-grid__ghost-selector")).toBe(
            true
        );

        // GhostSelector should be called with the new element
        expect(GhostSelector).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining({
                itemClass: expect.any(String),
            })
        );
    });

    it("should handle empty allIds array", () => {
        // Create a clean container without any pre-existing item elements
        const emptyContainer = document.createElement("div");
        emptyContainer.classList.add("file-grid__container");
        document.body.appendChild(emptyContainer);

        // Clear previous FileGridItem mock calls
        (FileGridItem as unknown as Mock).mockClear();

        const container = new FileGridContainer(emptyContainer, {
            allIds: [],
        });

        // Verify that the container was created and assigned the empty array
        expect(container.allIds).toEqual([]);

        // Although we passed an empty allIds array, if there are item elements in the DOM,
        // they'll still be processed - but they should have undefined IDs
        const mockItems = (FileGridItem as unknown as Mock).mock.calls;
        mockItems.forEach((call) => {
            // Each call to FileGridItem should have undefined as the ID parameter
            expect(call[1].id).toBeUndefined();
        });
    });
});

describe("FileGridContainer Getters", () => {
    let containerElement: HTMLElement;
    let itemElements: HTMLElement[];
    let mockItemInstances: { el: HTMLElement; toggleSelect: Mock }[];

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create container element
        containerElement = document.createElement("div");
        containerElement.classList.add("file-grid__container");

        // Create item elements
        itemElements = [];
        for (let i = 0; i < 3; i++) {
            const itemEl = document.createElement("div");
            itemEl.classList.add("file-grid__item");
            containerElement.appendChild(itemEl);
            itemElements.push(itemEl);
        }

        document.body.appendChild(containerElement);

        // Create mock items that will be returned from FileGridItem
        mockItemInstances = itemElements.map((el) => ({
            el,
            toggleSelect: vi.fn(),
        }));

        // Set up FileGridItem mock to return our mock instances
        let callIndex = 0;
        (FileGridItem as unknown as Mock).mockImplementation(() => {
            return mockItemInstances[callIndex++];
        });

        // Mock other components
        (MultiSelectionBackboard as unknown as Mock).mockImplementation(() => ({
            selectedCount: 0,
            el: document.createElement("div"),
        }));

        (GhostSelector as unknown as Mock).mockImplementation(() => ({}));
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should properly expose el and itemEls getters", () => {
        // Create test IDs
        const testIds = ["item-1", "item-2", "item-3"];

        // Initialize container
        const container = new FileGridContainer(containerElement, {
            allIds: testIds,
        });

        // Test the el getter - should return the container element
        expect(container.el).toBe(containerElement);

        // Test the itemEls getter - should return the array of FileGridItem instances
        expect(container.itemEls).toHaveLength(3);
        expect(container.itemEls).toEqual(mockItemInstances);

        // Verify each item in the array has the expected properties
        container.itemEls.forEach((item, index) => {
            expect(item.el).toBe(itemElements[index]);
            expect(item.toggleSelect).toBeDefined();
        });
    });
});
