import FileGridContainer from "./GridContainer";
import { utils } from "../utils";
import { useFgGhostSelector } from "../utils/ghostSelector";

import type { GhostSelectorUtilsReturnType } from "../utils/ghostSelector";

type GhostSelectorOptions = {
    container: FileGridContainer;
    itemClass: string;
};

class GhostSelector {
    // ELEMENTS
    private _el: HTMLElement;
    private _container: FileGridContainer;

    // CONFIG
    private _itemClass: string;

    // STATE
    private _active: boolean;

    // UTILS
    private _useFgGhostSelector: ReturnType<typeof useFgGhostSelector>;

    // EVENTS
    private _containerMouseDown: (e: MouseEvent) => void;
    private _documentMouseMove: (e: MouseEvent) => void;
    private _documentMouseUp: (e: MouseEvent) => void;
    private _windowClick: (e: MouseEvent) => void;

    // HANDLERS
    private _setGhostSelectorStyle(dims: GhostSelectorUtilsReturnType) {
        this._el.style.top = `${dims.y}px`;
        this._el.style.left = `${dims.x}px`;
        this._el.style.width = `${dims.width}px`;
        this._el.style.height = `${dims.height}px`;
    }

    private _assignGhostSelectorEvents() {
        this._containerMouseDown = (e) => {
            this._useFgGhostSelector.toggleFgGhostSelect(true, e);
        };
        this._documentMouseMove = (e) => {
            const dims = this._useFgGhostSelector.updateFgGhostSelectFrame(
                e.clientX,
                e.clientY
            );
            if (dims) {
                this._setGhostSelectorStyle(dims);
                this._active = dims.active;
            } else return;

            const selectedIds = this._useFgGhostSelector.checkFgCollidedItems(
                this._el,
                this._itemClass,
                this._container.allIds
            );

            this._container.selectedIds = selectedIds;
        };
        this._documentMouseUp = (e) => {
            const dims = this._useFgGhostSelector.toggleFgGhostSelect(false, e);
            this._setGhostSelectorStyle(dims);
        };
        this._windowClick = (e) => {
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
        };

        this._container.el.addEventListener(
            "mousedown",
            this._containerMouseDown
        );
        document.addEventListener("mousemove", this._documentMouseMove);
        document.addEventListener("mouseup", this._documentMouseUp);
        window.addEventListener("click", this._windowClick);
    }

    constructor(
        root: HTMLElement | string,
        { container, itemClass }: GhostSelectorOptions
    ) {
        const { getElement } = utils();

        // Assign the root element and add the class
        if (root === "") {
            const board = document.createElement("div");
            this._el = container.el.insertAdjacentElement(
                "afterbegin",
                board
            ) as HTMLElement;
            this._el.classList.add("file-grid-ghost-selector");
        } else {
            this._el = getElement(root);
        }

        this._container = container;
        this._itemClass = itemClass;

        this._useFgGhostSelector = useFgGhostSelector();
        this._assignGhostSelectorEvents();
    }

    public destroy() {
        this._container.el.removeEventListener(
            "mousedown",
            this._containerMouseDown
        );
        document.removeEventListener("mousemove", this._documentMouseMove);
        document.removeEventListener("mouseup", this._documentMouseUp);
        window.removeEventListener("click", this._windowClick);
    }
}

export default GhostSelector;
