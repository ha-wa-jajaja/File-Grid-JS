import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridItem from "./Item";
import MultiSelectionBackboard from "./MultiSelectionBoard";
import GhostSelector from "./GhostSelector";

import { utils } from "../utils";
import { useFgSelection } from "../utils/selection";
import type { SelectedModelActions } from "../types";

type FileGridContainerOptions = {
    allIds: string[];
    _itemClass: string;
    itemSelectedClass: string;
    uploader: HTMLElement | string | null;
    scrollSensor: HTMLElement | string | Window;
    multiBoard: HTMLElement | string;
    ghostSelector: HTMLElement | string;
};

// TODO: Cols & Gap -> to scss or in config?
// TODO: scrollSpeed
// TODO: scrollThreshold

class FileGridContainer {
    private _el: HTMLElement;

    // OUTER ELEMENTS
    private _uploader: FileGridFileUploader | null = null;
    private _scrollSensor: AutoScrollSensor | null;
    private _multiBoard: MultiSelectionBackboard;

    // CHILDREN ELEMENTS
    private _ghostSelector: GhostSelector;
    private _itemEls: FileGridItem[];

    // STATE
    private _allIds: string[];
    private _selectedIds: Set<string>;
    private _itemClass: string;
    private _itemSelectedClass: string;

    // UTILS
    private _getUpdatedIdModel: ReturnType<
        typeof useFgSelection
    >["getUpdatedIdModel"];

    // GETTERS & SETTERS
    public get el() {
        return this._el;
    }

    public get selectedIds() {
        return this._selectedIds;
    }

    public get allIds() {
        return this._allIds;
    }

    public set selectedIds(items: Set<string>) {
        this._selectedIds = items;
        this._allIds.forEach((id, index) => {
            if (this.selectedIds.has(id)) {
                this._itemEls[index].toggleSelect(true);
            } else {
                this._itemEls[index].toggleSelect(false);
            }
        });
        this._multiBoard.selectedCount = items.size;
    }

    /**
     * Sets the list of ID options and refreshes the child elements by the provided _itemClass.
     *
     * @param ids - The new list of IDs to set.
     */
    public set allIds(ids: string[]) {
        this._allIds = ids;
        this._assignGridItems(ids);
    }

    // HANDLERS
    private _assignGridItems(ids: string[]) {
        const itemEls = document.querySelectorAll(this._itemClass);

        this._itemEls = Array.from(itemEls).map(
            (el, idx) =>
                new FileGridItem(el as HTMLElement, {
                    id: ids[idx],
                    container: this,
                    uploader: this._uploader,
                    multiItemBoard: this._multiBoard,
                    selectedClass: this._itemSelectedClass,
                })
        );
    }

    public updateSelectionModel(
        action: SelectedModelActions,
        targetId?: string
    ) {
        if (!action) return;

        this.selectedIds = this._getUpdatedIdModel({
            action,
            targetId,
            allIds: this._allIds,
            selectedIds: this._selectedIds,
        });
    }

    constructor(
        root: HTMLElement | string = ".file-grid-container",
        {
            allIds = [],
            _itemClass = ".file-grid-item",
            itemSelectedClass = "selected",
            // element options
            scrollSensor = window,
            uploader = ".file-grid-file-uploader",
            multiBoard = ".file-grid-multi-selection-board",
            ghostSelector = ".file-grid-ghost-selector",
        }: Partial<FileGridContainerOptions> = {}
    ) {
        const { getElement } = utils();

        // Assign the root element and add the class
        this._el = getElement(root);
        this._el.classList.add("file-grid-container");

        // Assign classes
        this._itemClass = _itemClass;
        this._itemSelectedClass = itemSelectedClass;

        // Assign ID list
        this.allIds = allIds;
        this._selectedIds = new Set<string>();

        // Assign elements
        uploader && (this._uploader = new FileGridFileUploader(uploader));
        this._scrollSensor = new AutoScrollSensor(
            typeof scrollSensor === "string"
                ? getElement(scrollSensor)
                : scrollSensor
        );
        this._multiBoard = new MultiSelectionBackboard(multiBoard);
        this._ghostSelector = new GhostSelector(ghostSelector, {
            container: this,
            itemClass: _itemClass,
        });

        this._getUpdatedIdModel = useFgSelection().getUpdatedIdModel;
    }
}

export default FileGridContainer;
