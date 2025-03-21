import FileGridFileUploader from "./FileUploader";
import AutoScrollSensor from "./AutoScrollSensor";
import FileGridContainer from "./GridContainer";

import { utils } from "../utils";

// TODO: DisableUpload
type FileGridOptions<T> = {
    allIds: T[];
    uploader: string | null;
    scrollSensor: string | null;
    container: string;
    item: { el: string; selectedClassName: string };
    multiBoard: string;
    ghostSelector: string | null;
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

    // TODO: Do we need default values in the children if it's defined here?
    public constructor(
        root: HTMLElement | string,
        {
            allIds = [],
            uploader = ".file-grid__file-uploader",
            scrollSensor = ".file-grid__auto-scroll-sensor",
            container = ".file-grid__container",
            item = {
                el: ".file-grid__item",
                selectedClassName: "file-grid__item--selected",
            },
            multiBoard = ".file-grid__multi-board",
            ghostSelector = null,
        }: Partial<FileGridOptions<T>> = {}
    ) {
        if (!allIds.length) console.warn("No ids are passed into FileGrid");

        const { getElement } = utils();
        this._el = getElement(root);
        this._el.classList.add("file-grid");

        uploader && (this._uploader = new FileGridFileUploader(uploader));
        scrollSensor &&
            (this._scrollSensor = new AutoScrollSensor(scrollSensor));
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
