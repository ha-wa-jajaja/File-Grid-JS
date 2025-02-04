type FileGridUploaderOptions = {
    droppedFilesEvent: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void;
};

class FileGridFileUploader {
    private _el: HTMLElement;
    private _uploadHintBoardElement: HTMLElement;

    private _disabledUpload: Boolean = false;
    private _showDropUploadBoard: Boolean = false;
    private _isInternalDragging: Boolean = false;
    private _canCloseBackboard: Boolean = false;

    private _onDroppedFiles: FileGridUploaderOptions["droppedFilesEvent"] =
        () => {};

    public set disabledUpload(value: Boolean) {
        this._disabledUpload = value;
    }

    public set onDroppedFiles(
        func: FileGridUploaderOptions["droppedFilesEvent"]
    ) {
        this._onDroppedFiles = func;
    }

    private set showDropUploadBoard(value: Boolean) {
        this._showDropUploadBoard = value;
        this._uploadHintBoardElement.style.display = value ? "block" : "none";
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
        {}: Partial<FileGridUploaderOptions>
    ) {}
}
