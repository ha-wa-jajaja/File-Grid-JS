import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridItem from "./Item";
import MultiSelectionBackboard from "./MultiSelectionBoard";
import GhostSelector from "./GhostSelector";

import { utils } from "../utils";
import { useFgSelection } from "../utils/selection";
import type { SelectedModelActions } from "../types";

type FileGridContainerOptions = {
    // TODO:SHOULD TAKE DYNAMIC TYPE?
    allIds: string[];
    itemClass: string;
    itemSelectedClassName: string;
    uploader: FileGridFileUploader | null;
    scrollSensor: AutoScrollSensor | null;
    multiBoard: HTMLElement | string;
    ghostSelector: HTMLElement | string | null;
};

// TODO: Cols & Gap -> to scss or in config?
// TODO: scrollSpeed
// TODO: scrollThreshold

class FileGridContainer {
    private _el: HTMLElement;

    // OUTER ELEMENTS
    private _uploader: FileGridFileUploader | null = null;
    private _scrollSensor: AutoScrollSensor | null;

    // CHILDREN/SELECTION ELEMENTS
    private _ghostSelector: GhostSelector;
    private _itemEls: FileGridItem[];
    private _multiBoard: MultiSelectionBackboard;

    // STATE
    private _allIds: string[];
    private _selectedIds: Set<string>;
    private _itemClass: string;
    private _itemSelectedClassName: string;

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
                    selectedClass: this._itemSelectedClassName,
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
        root: HTMLElement | string = ".file-grid__container",
        {
            allIds = [],
            itemClass = ".file-grid__item",
            itemSelectedClassName = "selected",
            scrollSensor = null,
            uploader = null,
            multiBoard = ".file-grid__multi-selection-board",
            ghostSelector = null,
        }: Partial<FileGridContainerOptions> = {}
    ) {
        const { getElement } = utils();

        // Assign the root element and add the class
        this._el = getElement(root);
        this._el.classList.add("file-grid__container");

        // Assign classes
        this._itemClass = itemClass;
        this._itemSelectedClassName = itemSelectedClassName;

        // Assign outer elements
        uploader && (this._uploader = uploader);
        scrollSensor && (this._scrollSensor = scrollSensor);

        // Create instances of the selection elements
        this._multiBoard = new MultiSelectionBackboard(multiBoard);

        let ghostSelectorEl = ghostSelector;
        if (!ghostSelectorEl) {
            ghostSelectorEl = this._el.appendChild(
                document.createElement("div")
            );
            ghostSelectorEl.classList.add("file-grid__ghost-selector");
        }
        this._ghostSelector = new GhostSelector(ghostSelectorEl, {
            container: this,
            itemClass: itemClass,
        });

        // Assign ID list & create elements via setter of allIds
        this.allIds = allIds;
        this._selectedIds = new Set<string>();

        this._getUpdatedIdModel = useFgSelection().getUpdatedIdModel;
    }
}

export default FileGridContainer;
