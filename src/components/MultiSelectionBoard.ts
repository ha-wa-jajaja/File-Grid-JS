import { utils } from "../../utils";

class MultiSelectionBackboard {
    // ELEMENTS
    private _el: HTMLElement;
    private _counterEl: HTMLElement;

    // STATE
    private _selectedCount: number;

    // GETTERS/SETTERS
    public get el() {
        return this._el;
    }

    public set selectedCount(count: number) {
        this._selectedCount = count;
        this._counterEl.textContent = count.toString();
    }

    constructor(root: HTMLElement | string) {
        const { getElement } = utils();
        this._el = getElement(root);

        const counterEl = this._el.querySelector(".file-grid__selected-count");
        if (counterEl) this._counterEl = counterEl as HTMLElement;
        else console.warn("No counter element found in backboard element");

        this._selectedCount = 0;
    }
}

export default MultiSelectionBackboard;
