type FileGridJsOptions = {};

class FileGrid {
    private uploadHintBoardElement: HTMLElement;
    private contentWrapperElement: HTMLElement;

    private disableUpload: Boolean = false;
    private selectedIds: string[] = [];

    private onDroppedFiles: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void = () => {};

    public constructor(
        root: HTMLElement | string,
        {}: Partial<FileGridJsOptions>
    ) {}
}
