import FileGridFileUploader from "./FileUploader";
import FileGridContainer from "./GridContainer";
import MultiSelectionBackboard from "./MultiSelectionBoard";

import type { FgItemActions } from "../utils/itemActions";

import { utils } from "../utils";
import { useFgItemActions } from "../utils/itemActions";

type FileGridItemOptions = {
    uploader: FileGridFileUploader | null;
    container: FileGridContainer;
    multiItemBoard: MultiSelectionBackboard;
    id: string;
    selectedClass?: string;
};

class FileGridItem {
    private _el: HTMLElement;

    private _uploader: FileGridFileUploader | null;
    private _container: FileGridContainer;
    private _multiItemBoard: MultiSelectionBackboard;

    private _id: string;
    private _selectedClass: string;

    private _actions: FgItemActions;

    private _selected: boolean;

    private onMouseDown = (e: MouseEvent) => {
        const action = this._actions.onFgItemMouseDown(e, this._selected);

        if (!action) return;
        this._container.updateSelectionModel(action, this._id);
    };

    private onClick = () => {
        const action = this._actions.onFgItemClick();
        if (!action) return;
        this._container.updateSelectionModel(action, this._id);
    };

    private onDragStart = (e: DragEvent) => {
        const { dragging } = this._actions.onFgItemDragStart(
            e,
            this._container.selectedIds,
            this._multiItemBoard
        );

        if (!this._uploader) return;
        this._uploader.isInternalDragging = dragging;
    };

    private onDragEnd = () => {
        const { dragging } = this._actions.onFgItemDragEnd();

        if (!this._uploader) return;
        this._uploader.isInternalDragging = dragging;
    };

    private setItemEventListeners(root: HTMLElement) {
        root.addEventListener("mousedown", this.onMouseDown);
        root.addEventListener("click", this.onClick);
        root.addEventListener("dragstart", this.onDragStart);
        root.addEventListener("dragend", this.onDragEnd);
    }

    public toggleSelect(state: boolean) {
        this._selected = state;
        if (state) this._el.classList.add(this._selectedClass);
        else this._el.classList.remove(this._selectedClass);
    }

    constructor(
        root: HTMLElement | string,
        {
            id,
            selectedClass,
            uploader,
            container,
            multiItemBoard,
        }: FileGridItemOptions
    ) {
        const { getElement } = utils();
        this._actions = useFgItemActions();

        this._el = getElement(root);
        this.setItemEventListeners(this._el);

        this._id = id;
        this._selectedClass = selectedClass || "selected";

        this._uploader = uploader;
        this._container = container;
        this._multiItemBoard = multiItemBoard;
    }

    public destroy() {
        this._el.removeEventListener("mousedown", this.onMouseDown);
        this._el.removeEventListener("click", this.onClick);
        this._el.removeEventListener("dragstart", this.onDragStart);
        this._el.removeEventListener("dragend", this.onDragEnd);
    }
}

export default FileGridItem;
