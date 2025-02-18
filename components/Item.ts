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
};

class FileGridItem {
    private _el: HTMLElement;

    private _uploader: FileGridFileUploader | null;
    private _container: FileGridContainer;
    private _multiItemBoard: MultiSelectionBackboard;
    private _id: string;

    private _actions: FgItemActions;

    // TODO: Mouse actions
    private onMouseDown(e: MouseEvent) {
        const action = this._actions.onFgItemMouseDown(e, false);
        if (!action) return;
        this._container.updateSelectionModel(action, this._id);
    }

    private onClick() {
        const action = this._actions.onFgItemClick();
        if (!action) return;
        this._container.updateSelectionModel(action, this._id);
    }

    private onDragStart(e: DragEvent) {
        const { dragging } = this._actions.onFgItemDragStart(
            e,
            new Set([this._id]),
            this._multiItemBoard
        );

        console.log(this._uploader);

        if (!this._uploader) return;
        this._uploader.isInternalDragging = dragging;
        console.log("should set internal dragging");
        console.log(this._uploader.isInternalDragging);
    }

    private onDragEnd() {
        const { dragging } = this._actions.onFgItemDragEnd();

        if (!this._uploader) return;
        this._uploader.isInternalDragging = dragging;
    }

    private setFileUploaderEventListeners(root: HTMLElement) {
        root.addEventListener("mousedown", (e) => this.onMouseDown(e));
        root.addEventListener("click", () => this.onClick());
        root.addEventListener("dragstart", (e) => this.onDragStart(e));
        root.addEventListener("dragend", () => this.onDragEnd());
    }

    constructor(
        root: HTMLElement | string,
        { uploader, container, multiItemBoard, id }: FileGridItemOptions
    ) {
        const { getElement } = utils();
        this._actions = useFgItemActions();

        this._el = getElement(root);
        // this._el.classList.add("file-grid-ghost-selector");
        this.setFileUploaderEventListeners(this._el);

        this._uploader = uploader;
        this._container = container;
        this._multiItemBoard = multiItemBoard;
        this._id = id;
    }

    public destroy() {
        this._el.removeEventListener("mousedown", this.onMouseDown);
        this._el.removeEventListener("click", this.onClick);
        this._el.removeEventListener("dragstart", this.onDragStart);
        this._el.removeEventListener("dragend", this.onDragEnd);
    }
}

export default FileGridItem;
