import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridItem from "./Item";

import { useFgSelection } from "../utils/selection";
import type { SelectedModelActions } from "../types";

class FileGridContainer {
    private _uploader: FileGridFileUploader | null;
    private _scrollSensor: AutoScrollSensor | null;
    private _itemEls: FileGridItem[];

    private _allIds: string[];
    private _selectedIds: Set<string>;
    private _itemClassName: string;

    private _getUpdatedIdModel: ReturnType<
        typeof useFgSelection
    >["getUpdatedIdModel"];

    public get selectedIds() {
        return this._selectedIds;
    }
    private get allIds() {
        return this._allIds;
    }

    public set selectedIds(items: Set<string>) {
        this._selectedIds = items;
    }
    private set allIds(items: string[]) {
        this._allIds = items;
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

    // TODO: Update models
    // TODO: Get models
    // TODO: Ghost selection
}

export default FileGridContainer;
