type FileGridUploaderOptions = {};

class FileGridFileUploader {
    private _el: HTMLElement;
    private _uploadHintBoardElement: HTMLElement;

    private _disableUpload: Boolean = false;

    private onDroppedFiles: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void = () => {};

    public constructor(
        root: HTMLElement | string,
        {}: Partial<FileGridUploaderOptions>
    ) {}
}
