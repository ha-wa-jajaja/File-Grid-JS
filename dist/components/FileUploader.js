import { utils } from "../utils/utils.js";
class FileGridFileUploader {
    set disabledUpload(value) {
        this._disabledUpload = value;
    }
    set onDroppedFiles(func) {
        this._onDroppedFiles = func;
    }
    set canCloseBackboard(value) {
        this._canCloseBackboard = value;
    }
    set showDropUploadBoard(value) {
        this._showDropUploadBoard = value;
        this._uploadHintBoardElement.style.display = value ? "block" : "none";
        this._fileGridUploaderContentElement.classList.toggle(
            "file-grid-content-hide"
        );
    }
    _overAction(event, bool) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this._isInternalDragging || this._disabledUpload) return;
        if (bool) {
            this.canCloseBackboard = false;
            this.showDropUploadBoard = true;
        } else {
            if (!this._canCloseBackboard) {
                this.canCloseBackboard = true;
                return;
            }
            this.showDropUploadBoard = false;
        }
    }
    _emitFiles(event) {
        var _a;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (
            !((_a = event.dataTransfer) === null || _a === void 0
                ? void 0
                : _a.items) ||
            this._disabledUpload
        )
            return;
        const files = [];
        const folders = [];
        Array.from(event.dataTransfer.items).forEach((item) => {
            const entry = item.webkitGetAsEntry();
            if (!entry) throw new Error("Failed to get entry");
            if (entry.isFile) {
                files.push(entry);
            } else if (entry.isDirectory) {
                folders.push(entry);
            }
        });
        this._onDroppedFiles(files, folders);
        this._showDropUploadBoard = false;
    }
    setFileUploaderEventListeners(root) {
        root.addEventListener("dragover", (event) => event.preventDefault());
        root.addEventListener("dragenter", (event) =>
            this._overAction(event, true)
        );
        root.addEventListener("dragleave", (event) =>
            this._overAction(event, false)
        );
        root.addEventListener("drop", (event) => this._emitFiles(event));
    }
    constructor(
        root,
        {
            uploadBackBoardElement = ".file-grid-file-uploader-backboard",
            contentAreaElement = ".file-grid-file-uploader-content",
        } = {}
    ) {
        // TODO: Content area
        this._disabledUpload = false;
        this._showDropUploadBoard = false;
        this._isInternalDragging = false;
        this._canCloseBackboard = false;
        this._onDroppedFiles = () => {};
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
