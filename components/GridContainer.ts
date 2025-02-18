import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridItem from "./Item";
import MultiSelectionBackboard from "./MultiSelectionBoard";
import GhostSelector from "./GhostSelector";

import { utils } from "../utils";
import { useFgSelection } from "../utils/selection";
import type { SelectedModelActions } from "../types";

type FileGridContainerOptions = {
    itemClassName: string;
    uploader: HTMLElement | string;
    scrollSensor: HTMLElement | string | Window;
    multiBoard: HTMLElement | string;
    ghostSelector: HTMLElement | string;
    allIds: string[];
};

// TODO: Cols
// TODO: Gap
// TODO: scrollSpeed
// TODO: scrollThreshold

class FileGridContainer {
    private _el: HTMLElement;

    private _uploader: FileGridFileUploader | null;
    private _scrollSensor: AutoScrollSensor | null;
    private _multiBoard: MultiSelectionBackboard;
    private _ghostSelector: GhostSelector;
    private _itemEls: FileGridItem[];


    private _allIds: string[];
    private _selectedIds: Set<string>;
    private _itemClassName: string;

    private _getUpdatedIdModel: ReturnType<
        typeof useFgSelection
    >["getUpdatedIdModel"];

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
    }
    private set allIds(ids: string[]) {
        this._allIds = ids;
        this._assignGridItems(ids);
    }

    private _assignGridItems(ids: string[]) {
        console.log("Assigning grid items", ids);
        
        const itemEls = document.querySelectorAll("."+this._itemClassName);

        console.log("ItemEls", itemEls);
        

        this._itemEls = Array.from(itemEls).map(
            (el, idx) =>
                new FileGridItem(el as HTMLElement, {
                    id: ids[idx],
                    container: this,
                    uploader: this._uploader,
                    multiItemBoard: this._multiBoard,
                })
        );
    }

    public updateSelectionModel(
        action: SelectedModelActions,
        targetId?: string
    ) {
        this._selectedIds = this._getUpdatedIdModel({
            action,
            targetId,
            allIds: this._allIds,
            selectedIds: this._selectedIds,
        });
    }

    constructor(
        root: HTMLElement | string = ".file-grid-container",
        {
            itemClassName = ".file-grid-item",
            uploader = ".file-grid-file-uploader",
            scrollSensor = window,
            multiBoard = ".file-grid-multi-selection-board",
            ghostSelector = "",
            allIds = [],
        }: Partial<FileGridContainerOptions> = {}
    ) {
        const { getElement } = utils();

        // Assign the root element and add the class
        this._el = getElement(root);
        this._el.classList.add("file-grid-container");

        this._itemClassName = itemClassName;
        this._uploader = new FileGridFileUploader(uploader);
        this._scrollSensor = new AutoScrollSensor(
            typeof scrollSensor === "string"
                ? getElement(scrollSensor)
                : scrollSensor
        );
        this._multiBoard = new MultiSelectionBackboard(multiBoard);
        this._ghostSelector = new GhostSelector(ghostSelector, {container: this, itemClass: itemClassName});
        this.allIds = allIds;
        this._assignGridItems(allIds);

        this._selectedIds = new Set<string>();
        this._getUpdatedIdModel = useFgSelection().getUpdatedIdModel;
    }
}

export default FileGridContainer;
