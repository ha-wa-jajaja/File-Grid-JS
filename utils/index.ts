export const utils = () => {
    /**
     * Gets an HTML element from a CSS selector string or returns the element if directly provided
     * @param target CSS selector string or HTMLElement
     * @returns HTMLElement if found, null if not found
     * @throws TypeError if invalid input type provided
     */
    function getElement(target: string | HTMLElement): HTMLElement {
        // TODO: PARENT?
        if (typeof target === "string") {
            const el = document.querySelector(target);
            if (el) return el as HTMLElement;
        }

        if (target instanceof HTMLElement) {
            return target;
        }

        throw new TypeError(
            "Target must be a CSS selector string or HTMLElement"
        );
    }

    /**
     * Clamps a number between a minimum and maximum value.
     *
     * @param value - The number to clamp.
     * @param min - The minimum value to clamp to.
     * @param max - The maximum value to clamp to.
     * @returns The clamped value.
     */
    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    return { getElement, clamp };
};
