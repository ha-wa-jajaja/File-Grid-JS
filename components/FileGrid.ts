import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridContainer from "./GridContainer";

import { utils } from "../utils";

import type { AutoScrollConfig, ScrollConfigElement } from "./AutoScrollSensor";
import type { DropFilesCallback } from "./FileUploader";

type FileGridOptions<T> = {
    allIds: T[];
    uploader: string | null;
    scrollSensor: ScrollConfigElement;
    container: string;
    item: { el: string; selectedClassName: string };
    multiBoard: string;
    ghostSelector: string | null;
    autoScrollConfig: AutoScrollConfig;
    droppedFilesEvent: DropFilesCallback;
};

class FileGrid<T> {
    private _el: HTMLElement;

    private _uploader: FileGridFileUploader | null = null;
    private _scrollSensor: AutoScrollSensor | null = null;
    private _container: FileGridContainer<T>;

    public get selectedIds() {
        return this._container.selectedIds;
    }

    public set allIds(ids: T[]) {
        this._container.allIds = ids;
    }

    public disableUpload(state: boolean) {
        if (!this._uploader) return;
        this._uploader.disabledUpload = state;
    }

    public constructor(
        root: HTMLElement | string,
        // TODO: Spread all options from each component
        {
            allIds = [],
            uploader = ".file-grid__file-uploader",
            scrollSensor = window,
            container = ".file-grid__container",
            item = {
                el: ".file-grid__item",
                selectedClassName: "file-grid__item--selected",
            },
            multiBoard = ".file-grid__multi-board",
            ghostSelector = null,
            autoScrollConfig = {},
            droppedFilesEvent = () => {},
        }: Partial<FileGridOptions<T>> = {}
    ) {
        if (!allIds.length) console.warn("No ids are passed into FileGrid");

        const { getElement } = utils();
        this._el = getElement(root);
        this._el.classList.add("file-grid");

        if (uploader)
            this._uploader = new FileGridFileUploader(uploader, {
                droppedFilesEvent,
            });
        if (scrollSensor)
            this._scrollSensor = new AutoScrollSensor(
                scrollSensor,
                autoScrollConfig
            );

        this._container = new FileGridContainer<T>(container, {
            allIds,
            itemClass: item.el,
            itemSelectedClassName: item.selectedClassName,
            uploader: this._uploader,
            multiBoard,
            ghostSelector,
        });
    }
}

export default FileGrid;
