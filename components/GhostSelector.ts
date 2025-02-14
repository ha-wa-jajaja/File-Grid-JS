import FileGridContainer from "./GridContainer";
import { utils } from "../utils";
import { useFgGhostSelector } from "../utils/ghostSelector";

import type { GhostSelectorUtilsReturnType } from "../utils/ghostSelector";

class GhostSelector {
    private _el: HTMLElement;

    private _container: FileGridContainer;

    private _itemClass: string;

    private _active: boolean;

    private _useFgGhostSelector: ReturnType<typeof useFgGhostSelector>;

    private _setGhostSelectorStyle(dims: GhostSelectorUtilsReturnType) {
        this._el.style.top = `${dims.y}px`;
        this._el.style.left = `${dims.x}px`;
        this._el.style.width = `${dims.width}px`;
        this._el.style.height = `${dims.height}px`;
    }

    // TODO: Unloading actions
    private _assignGhostSelectorEvents() {
        this._container.el.addEventListener("mousedown", (e) => {
            this._useFgGhostSelector.toggleFgGhostSelect(true, e);
        });

        document.addEventListener("mousemove", (e) => {
            const dims = this._useFgGhostSelector.updateFgGhostSelectFrame(
                e.clientX,
                e.clientY
            );
            if (dims) this._setGhostSelectorStyle(dims);

            const selectedIds = this._useFgGhostSelector.checkFgCollidedItems(
                this._el,
                this._itemClass,
                this._container.allIds,
                this._container.selectedIds
            );
            this._container.selectedIds = selectedIds;
        });

        document.addEventListener("mouseup", (e) => {
            this._useFgGhostSelector.toggleFgGhostSelect(false, e);
        });

        window.addEventListener("click", (e) => {
            e.stopPropagation();

            if (this._active) {
                this._useFgGhostSelector.endFgGhostSelect();
                this._active = false;
                return;
            }

            const typedEvent = e as unknown as {
                target: { classList: { contains: (arg: string) => boolean } };
            };

            if (!e.target || !typedEvent.target.classList) return;
            if (!typedEvent.target.classList.contains(this._itemClass)) {
                this._container.updateSelectionModel("clear");
            }
        });
    }

    constructor(root: HTMLElement | string) {
        const { getElement } = utils();

        // Assign the root element and add the class
        this._el = getElement(root);
        this._el.classList.add("file-grid-ghost-selector");

        this._useFgGhostSelector = useFgGhostSelector();
    }
}

export default GhostSelector;
