type FileGridContainerOptions = {};

class FileGridContainer {
    private uploadHintBoardElement: HTMLElement;

    private disableUpload: Boolean = false;

    private onDroppedFiles: (
        files: FileSystemFileEntry[],
        folders: FileSystemDirectoryEntry[]
    ) => void = () => {};

    public constructor(
        root: HTMLElement | string,
        {}: Partial<FileGridContainerOptions>
    ) {}
}
