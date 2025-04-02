import { utils } from "../../utils";
import {
    checkShouldTriggerScroll,
    calculateScrollAmount,
} from "../../utils/autoScrollSensor";

export type ScrollConfigElement = HTMLElement | Window | string;

/**
 * Configuration options for the auto-scroll sensor.
 *
 * @property {number} [scrollThreshold] - The threshold in the element to trigger the auto-scroll.
 * For example, when the value is 0.3, the top 30% and bottom 30% of the element will trigger auto-scroll.
 * @property {number} [scrollSpeed] - The speed of the auto-scroll, ranging from 1 to 10.
 */
export type AutoScrollConfig = {
    enable?: boolean;
    scrollThreshold?: number;
    scrollSpeed?: number;
};

export const DEFAULT_AUTO_SCROLL_CONFIG: AutoScrollConfig = {
    enable: true,
    scrollThreshold: 0.2,
    scrollSpeed: 5,
};

class AutoScrollSensor {
    private _el: HTMLElement | Window;

    // CONFIG
    private _autoScrollThreshold: number;
    private _autoScrollSpeed: number;

    // STATE
    private _enable = false;
    private _moveDragAnimation: number | null = null;

    // GETTERS/SETTERS
    public set enable(state: boolean) {
        this._enable = state;
        if (state) {
            this._el.addEventListener("dragover", (e) =>
                this._checkTriggerScroll(e as MouseEvent)
            );
        } else {
            this._el.removeEventListener("dragover", (e) =>
                this._checkTriggerScroll(e as MouseEvent)
            );
        }
    }

    // HANDLERS
    private _getScrollerHeight() {
        return this._el instanceof Window
            ? window.innerHeight
            : this._el.clientHeight;
    }

    private getMouseYInElement(element: Element, event: MouseEvent) {
        const mousePageY = event.pageY;

        const { top } = element.getBoundingClientRect();

        // Calculate element's position relative to the page
        const elementPositionY = top + window.scrollY;

        // Calculate mouse position relative to the element
        const elementY = mousePageY - elementPositionY;

        return elementY;
    }

    private _getScrollerMouseYPosition(e: MouseEvent) {
        return this._el instanceof Window
            ? e.clientY
            : this.getMouseYInElement(this._el, e);
    }

    private _scrollElementY(y: number) {
        if (this._el instanceof Window) {
            window.scrollBy(0, y);
        } else {
            this._el.scrollTop += y;
        }
    }

    private _clearMoveDragAnim = () => {
        if (!this._moveDragAnimation) return;
        cancelAnimationFrame(this._moveDragAnimation);
        this._moveDragAnimation = null;
    };

    private _checkTriggerScroll(e: MouseEvent) {
        if (!this._enable) return;

        const currentMouseY = this._getScrollerMouseYPosition(e);
        const scrollerHeight = this._getScrollerHeight();

        // Use the extracted pure function
        const { shouldScroll, direction } = checkShouldTriggerScroll(
            currentMouseY,
            scrollerHeight,
            this._autoScrollThreshold
        );

        if (!shouldScroll) {
            this._clearMoveDragAnim();
            return;
        }

        if (this._moveDragAnimation) return;

        // Calculate how much to scroll per frame
        const movePerFrame = calculateScrollAmount(
            direction,
            this._autoScrollSpeed
        );

        const doScroll = () => {
            this._scrollElementY(movePerFrame);
            this._moveDragAnimation = requestAnimationFrame(doScroll);
        };

        this._moveDragAnimation = requestAnimationFrame(doScroll);
    }

    constructor(
        root: ScrollConfigElement,
        {
            enable = true,
            scrollThreshold = 0.2,
            scrollSpeed = 5,
        }: AutoScrollConfig = {}
    ) {
        const { getElement } = utils();

        // Assign the root element and add the class
        if (root === window || root instanceof Window) {
            this._el = root;
        } else {
            this._el = getElement(root);
        }

        this._autoScrollThreshold = scrollThreshold;
        this._autoScrollSpeed = scrollSpeed;

        this.enable = enable;

        window.addEventListener("dragend", this._clearMoveDragAnim);
    }

    public destroy() {
        this.enable = false;
        window.removeEventListener("dragend", this._clearMoveDragAnim);
    }
}

export default AutoScrollSensor;
