class MultiSelectionBackboard {
    private _el: HTMLElement;
    private _counterEl: HTMLElement;
    private _selectedCount: number;

    public get el() {
        return this._el;
    }

    public set selectedCount(count: number) {
        this._selectedCount = count;
        this._counterEl.textContent = count.toString();
    }

    constructor(el: HTMLElement) {
        this._el = el;

        const counterEl = el.querySelector(".selected-count");
        if (counterEl) this._counterEl = counterEl as HTMLElement;
        else console.warn("No counter element found in backboard element");

        this._selectedCount = 0;
    }
}

export default MultiSelectionBackboard;
