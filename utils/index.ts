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

    return { getElement };
};
