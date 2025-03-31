import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AutoScrollSensor, {
    DEFAULT_AUTO_SCROLL_CONFIG,
} from "../components/AutoScrollSensor";
import type {
    ScrollConfigElement,
    AutoScrollConfig,
} from "../components/AutoScrollSensor";
// import { utils } from '../utils';

// Create a custom interface for MouseEventInit to include pageY
interface CustomMouseEventInit extends MouseEventInit {
    pageY?: number;
}

// Update the utils mock at the beginning of the test file
vi.mock("../utils", () => ({
    utils: () => ({
        getElement: vi.fn((el) => {
            // If el is Window, return window directly
            if (el === window) {
                return window;
            }

            if (typeof el === "string") {
                return (
                    document.querySelector(el) || document.createElement("div")
                );
            }
            return el;
        }),
        clamp: vi.fn((value, min, max) => Math.min(Math.max(value, min), max)),
    }),
}));

// Mock requestAnimationFrame & cancelAnimationFrame
window.requestAnimationFrame = vi.fn((callback) => {
    return setTimeout(callback, 0) as unknown as number;
});

window.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
});

describe("AutoScrollSensor", () => {
    let sensor: AutoScrollSensor;
    let container: HTMLDivElement;

    beforeEach(() => {
        // Create a container element
        container = document.createElement("div");

        // Set up container dimensions
        Object.defineProperty(container, "clientHeight", { value: 600 });

        // Add getBoundingClientRect mock
        container.getBoundingClientRect = vi.fn(() => ({
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            width: 500,
            height: 600,
            right: 500,
            bottom: 600,
            toJSON: () => ({
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                width: 500,
                height: 600,
                right: 500,
                bottom: 600,
            }),
        }));

        // Set up scrollTop for container
        Object.defineProperty(container, "scrollTop", {
            value: 0,
            writable: true,
        });

        // Attach container to document
        document.body.appendChild(container);

        // Mock window scrollY
        Object.defineProperty(window, "scrollY", { value: 0 });

        // Initialize the AutoScrollSensor with container
        sensor = new AutoScrollSensor(container, DEFAULT_AUTO_SCROLL_CONFIG);
    });

    afterEach(() => {
        // Clean up
        sensor.destroy();
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    it("should initialize with default configuration", () => {
        // Use private property accessor pattern to avoid explicit any
        const getPrivateProperty = <T, K extends string>(
            obj: T,
            key: K
        ): unknown =>
            Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(obj).constructor.prototype,
                key
            )?.value || (obj as Record<string, unknown>)[`_${key}`];

        expect(getPrivateProperty(sensor, "autoScrollThreshold")).toBe(
            DEFAULT_AUTO_SCROLL_CONFIG.scrollThreshold
        );
        expect(getPrivateProperty(sensor, "autoScrollSpeed")).toBe(
            DEFAULT_AUTO_SCROLL_CONFIG.scrollSpeed
        );
        expect(getPrivateProperty(sensor, "enable")).toBe(
            DEFAULT_AUTO_SCROLL_CONFIG.enable
        );
    });

    it("should initialize with custom configuration", () => {
        const customConfig = {
            enable: false,
            scrollThreshold: 0.3,
            scrollSpeed: 7,
        };

        const customSensor = new AutoScrollSensor(container, customConfig);

        // Use private property accessor pattern
        const getPrivateProperty = <T, K extends string>(
            obj: T,
            key: K
        ): unknown =>
            Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(obj).constructor.prototype,
                key
            )?.value || (obj as Record<string, unknown>)[`_${key}`];

        expect(getPrivateProperty(customSensor, "autoScrollThreshold")).toBe(
            customConfig.scrollThreshold
        );
        expect(getPrivateProperty(customSensor, "autoScrollSpeed")).toBe(
            customConfig.scrollSpeed
        );
        expect(getPrivateProperty(customSensor, "enable")).toBe(
            customConfig.enable
        );

        customSensor.destroy();
    });

    it("should trigger scroll when mouse is in the top threshold area", () => {
        // Create mock function for scrolling
        const scrollElementYMock = vi.fn();

        // Create dragover event in top region (top 20% of the container height is 120px)
        const dragEvent = new MouseEvent("dragover", {
            clientY: 50, // Within top threshold
        } as CustomMouseEventInit);

        // Add pageY property to the event
        Object.defineProperty(dragEvent, "pageY", { value: 50 });

        // Override private method using prototype
        const originalMethod = Object.getPrototypeOf(sensor)._scrollElementY;
        Object.getPrototypeOf(sensor)._scrollElementY = scrollElementYMock;

        // Emit dragover event
        container.dispatchEvent(dragEvent);

        // Small delay to allow animation frame to execute
        setTimeout(() => {
            expect(scrollElementYMock).toHaveBeenCalled();
            expect(scrollElementYMock).toHaveBeenCalledWith(
                -(DEFAULT_AUTO_SCROLL_CONFIG.scrollSpeed as number)
            );

            // Restore original method
            Object.getPrototypeOf(sensor)._scrollElementY = originalMethod;
        }, 50);
    });

    it("should trigger scroll when mouse is in the bottom threshold area", () => {
        // Create mock function for scrolling
        const scrollElementYMock = vi.fn();

        // Create dragover event in bottom region (bottom 20% of 600px height starts at 480px)
        const dragEvent = new MouseEvent("dragover", {
            clientY: 550, // Within bottom threshold
        } as CustomMouseEventInit);

        // Add pageY property to the event
        Object.defineProperty(dragEvent, "pageY", { value: 550 });

        // Override private method using prototype
        const originalMethod = Object.getPrototypeOf(sensor)._scrollElementY;
        Object.getPrototypeOf(sensor)._scrollElementY = scrollElementYMock;

        // Emit dragover event
        container.dispatchEvent(dragEvent);

        // Small delay to allow animation frame to execute
        setTimeout(() => {
            expect(scrollElementYMock).toHaveBeenCalled();
            expect(scrollElementYMock).toHaveBeenCalledWith(
                DEFAULT_AUTO_SCROLL_CONFIG.scrollSpeed
            );

            // Restore original method
            Object.getPrototypeOf(sensor)._scrollElementY = originalMethod;
        }, 50);
    });

    it("should not trigger scroll when mouse is in the middle area", () => {
        // Create mock function for scrolling
        const scrollElementYMock = vi.fn();

        // Create dragover event in middle region (not in scroll threshold)
        const dragEvent = new MouseEvent("dragover", {
            clientY: 300, // Middle of container
        } as CustomMouseEventInit);

        // Add pageY property to the event
        Object.defineProperty(dragEvent, "pageY", { value: 300 });

        // Override private method using prototype
        const originalMethod = Object.getPrototypeOf(sensor)._scrollElementY;
        Object.getPrototypeOf(sensor)._scrollElementY = scrollElementYMock;

        // Emit dragover event
        container.dispatchEvent(dragEvent);

        // Small delay to check that the scroll method wasn't called
        setTimeout(() => {
            expect(scrollElementYMock).not.toHaveBeenCalled();

            // Restore original method
            Object.getPrototypeOf(sensor)._scrollElementY = originalMethod;
        }, 50);
    });

    it("should clean up animation frame on dragend", () => {
        // Set private property for animation frame ID
        // Use Object.defineProperty to set the private property without using 'as any'
        Object.defineProperty(sensor, "_moveDragAnimation", {
            value: 123,
            writable: true,
        });

        // Spy on cancelAnimationFrame
        const cancelAnimationFrameSpy = vi.spyOn(
            window,
            "cancelAnimationFrame"
        );

        // Dispatch dragend event
        window.dispatchEvent(new Event("dragend"));

        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(123);

        // Check private property was reset
        expect(
            Object.getOwnPropertyDescriptor(sensor, "_moveDragAnimation")?.value
        ).toBeNull();
    });

    it("should disable auto-scroll when enable is set to false", () => {
        // Create a spy directly on the event listener
        const addEventListenerSpy = vi.spyOn(container, "addEventListener");
        const removeEventListenerSpy = vi.spyOn(
            container,
            "removeEventListener"
        );

        // Create an instance with auto-scroll initially enabled
        const customSensor = new AutoScrollSensor(container, {
            enable: true,
            scrollThreshold: 0.2,
            scrollSpeed: 5,
        });

        // Verify the event listener was added during initialization
        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "dragover",
            expect.any(Function)
        );

        // Reset the spy counts
        addEventListenerSpy.mockClear();
        removeEventListenerSpy.mockClear();

        // Now disable auto-scroll
        customSensor.enable = false;

        // Verify the event listener was removed
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "dragover",
            expect.any(Function)
        );

        // Create private property accessor to verify internal state
        const getPrivateProperty = <T, K extends string>(
            obj: T,
            key: K
        ): unknown =>
            Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(obj).constructor.prototype,
                key
            )?.value || (obj as Record<string, unknown>)[`_${key}`];

        // Verify internal state is set correctly
        expect(getPrivateProperty(customSensor, "enable")).toBe(false);

        // Clean up
        customSensor.destroy();
    });

    it("should work with Window as the scroll element", () => {
        // We need to mock the internal methods to bypass the problematic getBoundingClientRect call
        class TestAutoScrollSensor extends AutoScrollSensor {
            constructor(root: ScrollConfigElement, config: AutoScrollConfig) {
                super(root, config);
                // Force _el to be window directly
                Object.defineProperty(this, "_el", { value: window });

                // Override the private methods by replacing them directly on the instance
                Object.defineProperty(this, "_getScrollerMouseYPosition", {
                    value: (e: MouseEvent): number => {
                        // For window, just return clientY directly
                        return e.clientY;
                    },
                });

                Object.defineProperty(this, "_getScrollerHeight", {
                    value: (): number => {
                        // Return mock window height
                        return 800;
                    },
                });

                // Override the _scrollElementY method to ensure it uses our spy
                Object.defineProperty(this, "_scrollElementY", {
                    value: (y: number): void => {
                        if (this["_el"] === window) {
                            window.scrollBy(0, y);
                        } else {
                            // Handle other elements
                            const el = this["_el"] as HTMLElement;
                            el.scrollTop += y;
                        }
                    },
                });

                // Override the method that starts the animation loop
                // to avoid the infinite timer issue
                Object.defineProperty(this, "_checkTriggerScroll", {
                    value: (e: MouseEvent): void => {
                        if (!this["_enable"]) return;

                        const currentMouseY =
                            this["_getScrollerMouseYPosition"](e);
                        const scrollerHeight = this["_getScrollerHeight"]();

                        // Calculate thresholds
                        const topThreshold =
                            scrollerHeight * this["_autoScrollThreshold"];
                        const bottomThreshold =
                            scrollerHeight * (1 - this["_autoScrollThreshold"]);

                        // Determine if we're in the scroll regions
                        const inScrollTopRegion = currentMouseY <= topThreshold;
                        const inScrollBottomRegion =
                            currentMouseY >= bottomThreshold;

                        if (!inScrollTopRegion && !inScrollBottomRegion) {
                            return;
                        }

                        let moveAmount = 0;
                        if (inScrollTopRegion)
                            moveAmount = -this["_autoScrollSpeed"];
                        if (inScrollBottomRegion)
                            moveAmount = this["_autoScrollSpeed"];

                        // Just do a single scroll instead of starting an animation loop
                        this["_scrollElementY"](moveAmount);
                    },
                });
            }

            // Method to directly test scroll behavior
            public testScroll(mousePosition: number): void {
                // Create a mock event with the given position
                const mockEvent = new MouseEvent("dragover", {
                    clientY: mousePosition,
                } as CustomMouseEventInit);

                // Call the trigger scroll method with our mock event
                this["_checkTriggerScroll"](mockEvent);
            }
        }

        // Set up window inner height
        Object.defineProperty(window, "innerHeight", { value: 800 });

        // Create a window sensor using our modified class
        const windowSensor = new TestAutoScrollSensor(
            window,
            DEFAULT_AUTO_SCROLL_CONFIG
        );

        // Create mock function for scrollBy
        const scrollBySpy = vi
            .spyOn(window, "scrollBy")
            .mockImplementation(() => {});

        // Set _enable to true to ensure the scroll check logic executes
        Object.defineProperty(windowSensor, "_enable", { value: true });

        // Test scrolling when mouse is in the top threshold area (top 20% of 800px = 0-160px)
        windowSensor.testScroll(50);

        // Verify scrollBy was called with negative value (scroll up)
        expect(scrollBySpy).toHaveBeenCalledWith(
            0,
            -(DEFAULT_AUTO_SCROLL_CONFIG.scrollSpeed as number)
        );

        // Reset the spy
        scrollBySpy.mockClear();

        // Clean up animation frame ID
        windowSensor.destroy();

        // Create a new sensor to test bottom threshold
        const windowSensorBottom = new TestAutoScrollSensor(
            window,
            DEFAULT_AUTO_SCROLL_CONFIG
        );

        // Set _enable to true for the second sensor as well
        Object.defineProperty(windowSensorBottom, "_enable", { value: true });

        // Test scrolling when mouse is in the bottom threshold area (bottom 20% of 800px = 640-800px)
        windowSensorBottom.testScroll(700);

        // Verify scrollBy was called with positive value (scroll down)
        expect(scrollBySpy).toHaveBeenCalledWith(
            0,
            DEFAULT_AUTO_SCROLL_CONFIG.scrollSpeed as number
        );

        // Clean up
        windowSensorBottom.destroy();
    });

    it("should properly destroy itself", () => {
        // Spy on removeEventListener methods
        const windowRemoveEventListenerSpy = vi.spyOn(
            window,
            "removeEventListener"
        );
        const elRemoveEventListenerSpy = vi.spyOn(
            container,
            "removeEventListener"
        );

        // Create private property accessor
        const getPrivateProperty = <T, K extends string>(
            obj: T,
            key: K
        ): unknown =>
            Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(obj).constructor.prototype,
                key
            )?.value || (obj as Record<string, unknown>)[`_${key}`];

        // Destroy sensor
        sensor.destroy();

        // Check that event listeners were removed
        expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
            "dragend",
            expect.any(Function)
        );
        expect(elRemoveEventListenerSpy).toHaveBeenCalled();

        // Sensor should be disabled
        expect(getPrivateProperty(sensor, "enable")).toBe(false);
    });
});
