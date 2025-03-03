import { utils } from "../utils";

/**
 * Configuration options for the auto-scroll sensor.
 *
 * @property {number} [scrollThreshold] - The threshold for triggering auto-scroll, ranging from 0 to 1.
 * @property {number} [scrollSpeed] - The speed of the auto-scroll, ranging from 1 to 10.
 */
type AutoScrollConfig = {
    enable?: boolean;
    scrollThreshold?: number;
    scrollSpeed?: number;
};

class AutoScrollSensor {
    private _el: HTMLElement | Window;

    // CONFIG
    private _autoScrollThreshold: number;
    private _autoScrollSpeed: number;

    // STATE
    private _doObserveMouseMove = false;
    private _moveDragAnimation: number | null = null;

    // UTILS
    private _clamp: ReturnType<typeof utils>["clamp"];

    // GETTERS/SETTERS
    public set doObserveMouseMove(state: boolean) {
        this._doObserveMouseMove = state;
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
        if (!this._doObserveMouseMove) return;

        const currentMouseY = this._getScrollerMouseYPosition(e);
        const scrollerHeight = this._getScrollerHeight();

        const inScrollTopRegion =
            this._clamp(
                currentMouseY,
                0,
                scrollerHeight * this._autoScrollThreshold
            ) === currentMouseY;

        const inScrollBottomRegion =
            this._clamp(
                currentMouseY,
                scrollerHeight * (1 - this._autoScrollThreshold),
                scrollerHeight
            ) === currentMouseY;

        if (!inScrollTopRegion && !inScrollBottomRegion) {
            this._clearMoveDragAnim();
            return;
        }

        if (this._moveDragAnimation) return;

        let movePerFrame = 0;
        if (inScrollTopRegion) movePerFrame = -this._autoScrollSpeed;
        if (inScrollBottomRegion) movePerFrame = this._autoScrollSpeed;

        const doScroll = () => {
            this._scrollElementY(movePerFrame);
            this._moveDragAnimation = requestAnimationFrame(doScroll);
        };

        this._moveDragAnimation = requestAnimationFrame(doScroll);
    }

    constructor(
        root: Window | HTMLElement | string,
        {
            enable = true,
            scrollThreshold = 0.2,
            scrollSpeed = 5,
        }: AutoScrollConfig = {}
    ) {
        const { getElement, clamp } = utils();

        // Assign the root element and add the class
        if (root instanceof Window) {
            this._el = root;
        } else {
            this._el = getElement(root);
        }

        this._autoScrollThreshold = scrollThreshold;
        this._autoScrollSpeed = scrollSpeed;

        this._clamp = clamp;

        this.doObserveMouseMove = enable;

        window.addEventListener("dragend", this._clearMoveDragAnim);
    }

    public destroy() {
        this.doObserveMouseMove = false;
        window.removeEventListener("dragend", this._clearMoveDragAnim);
    }
}

export default AutoScrollSensor;
