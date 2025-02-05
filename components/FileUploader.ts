import { utils } from "../utils/utils";

type FileGridUploaderOptions = {
    uploadBackBoardElement: HTMLElement | string;
    contentAreaElement: HTMLElement | string;
    droppedFilesEvent: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void;
};

class FileGridFileUploader {
    private _el: HTMLElement;
    private _uploadHintBoardElement: HTMLElement;
    private _fileGridUploaderContentElement: HTMLElement;
    // TODO: Content area

    private _disabledUpload = false;
    private _showDropUploadBoard = false;
    private _isInternalDragging = false;
    private _canCloseBackboard = false;

    private _onDroppedFiles: FileGridUploaderOptions["droppedFilesEvent"] =
        () => {};

    public set disabledUpload(value: boolean) {
        this._disabledUpload = value;
    }

    public set onDroppedFiles(
        func: FileGridUploaderOptions["droppedFilesEvent"]
    ) {
        this._onDroppedFiles = func;
    }

    private set showDropUploadBoard(value: boolean) {
        this._showDropUploadBoard = value;
        this._uploadHintBoardElement.style.display = value ? "block" : "none";
        this._fileGridUploaderContentElement.classList.toggle(
            "file-grid-content-hide"
        );
    }

    private _overAction(event: Event, bool: boolean) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this._isInternalDragging || this._disabledUpload) return;

        if (bool) {
            this._canCloseBackboard = false;
            this._showDropUploadBoard = true;
        } else {
            if (!this._canCloseBackboard) {
                this._canCloseBackboard = true;
                return;
            }
            this._showDropUploadBoard = false;
        }
    }

    private _emitFiles(event: DragEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (!event.dataTransfer?.items || this._disabledUpload) return;

        const files: FileSystemFileEntry[] = [];
        const folders: FileSystemDirectoryEntry[] = [];

        Array.from(event.dataTransfer.items).forEach((item) => {
            const entry = item.webkitGetAsEntry();
            if (!entry) throw new Error("Failed to get entry");

            if (entry.isFile) {
                files.push(entry as FileSystemFileEntry);
            } else if (entry.isDirectory) {
                folders.push(entry as FileSystemDirectoryEntry);
            }
        });

        this._onDroppedFiles(files, folders);
        this._showDropUploadBoard = false;
    }

    private setFileUploaderEventListeners(root: HTMLElement) {
        root.addEventListener("dragover", (event) => event.preventDefault());
        root.addEventListener("dragenter", (event) =>
            this._overAction(event, true)
        );
        root.addEventListener("dragleave", (event) =>
            this._overAction(event, false)
        );
        root.addEventListener("drop", (event) => this._emitFiles(event));
    }

    public constructor(
        root: HTMLElement | string,
        {
            uploadBackBoardElement = ".file-grid-file-uploader-backboard",
            contentAreaElement = ".file-grid-file-uploader-content",
        }: Partial<FileGridUploaderOptions> = {}
    ) {
        try {
            const { getElement } = utils();
            this._el = getElement(root);
            this._el.classList.add("file-grid-file-uploader");
            this._uploadHintBoardElement = getElement(uploadBackBoardElement);
            this._uploadHintBoardElement.style.display = "none";
            this._fileGridUploaderContentElement =
                getElement(contentAreaElement);

            this.setFileUploaderEventListeners(this._el);
        } catch (error) {
            console.error("Error when setup FileUploader: ", error);
        }
    }
}

export default FileGridFileUploader;
