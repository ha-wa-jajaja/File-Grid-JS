import { utils } from "../utils";
import { uploaderUtils } from "../utils/uploader";
import type { UploaderUtils } from "../utils/uploader";

type FileGridUploaderOptions = {
    uploadBackBoardElement: HTMLElement | string;
    contentAreaElement: HTMLElement | string;
    droppedFilesEvent: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void;
};

// TODO: Disable upload
class FileGridFileUploader {
    // ELEMENTS
    private _el: HTMLElement;
    private _uploadHintBoardElement: HTMLElement;
    private _fileGridUploaderContentElement: HTMLElement;

    // STATE
    private _disabledUpload = false;
    private _showDropUploadBoard = false;
    private _isInternalDragging = false;

    // EVENTS
    private _onDroppedFiles: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void | Promise<void> = async () => {};

    // UTILS
    private _dragOverHandler: UploaderUtils["dragOverAction"];
    private _droppedFilesHandler: UploaderUtils["extractDroppedFiles"];

    // GETTERS/SETTERS
    public get isInternalDragging() {
        return this._isInternalDragging;
    }

    public set isInternalDragging(value: boolean) {
        this._isInternalDragging = value;
    }

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
        if (value) {
            this._fileGridUploaderContentElement.classList.add(
                "file-grid__content-hide"
            );
        } else {
            this._fileGridUploaderContentElement.classList.remove(
                "file-grid__content-hide"
            );
        }
    }

    // HANDLERS
    private _overAction(event: Event, isDragging: boolean) {
        const newState = this._dragOverHandler({
            event,
            isDragging,
            isInternalDragging: this._isInternalDragging,
            isUploadDisabled: this._disabledUpload,
        });

        this.showDropUploadBoard = newState.showDropUploadBoard;
    }

    private _emitFiles(event: DragEvent) {
        const { files, folders } = this._droppedFilesHandler(
            event,
            this._disabledUpload
        );

        this.showDropUploadBoard = false;

        const result = this._onDroppedFiles(files, folders);
        if (result instanceof Promise) {
            result.catch((error) =>
                console.error("Error in droppedFilesEvent:", error)
            );
        }
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
            uploadBackBoardElement = ".file-grid__file-uploader-backboard",
            contentAreaElement = ".file-grid__file-uploader-content",
            droppedFilesEvent = () => {},
        }: Partial<FileGridUploaderOptions> = {}
    ) {
        try {
            const { getElement } = utils();

            // Assign the root element and add the class
            this._el = getElement(root);
            this._el.classList.add("file-grid__file-uploader");

            // Assign the upload hint board element and hide it
            this._uploadHintBoardElement = getElement(uploadBackBoardElement);
            this._uploadHintBoardElement.style.display = "none";

            // Assign the content area element
            this._fileGridUploaderContentElement =
                getElement(contentAreaElement);

            // Assign the files receiving functions
            this.onDroppedFiles = droppedFilesEvent;

            this.setFileUploaderEventListeners(this._el);

            const { dragOverAction, extractDroppedFiles } = uploaderUtils();
            this._dragOverHandler = dragOverAction;
            this._droppedFilesHandler = extractDroppedFiles;
        } catch (error) {
            console.error("Error when setup FileUploader: ", error);
        }
    }
}

export default FileGridFileUploader;
