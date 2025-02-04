type FileGridJsOptions = {};

class FileGrid {
    private contentWrapperElement: HTMLElement;

    private disableUpload: Boolean = false;
    private selectedIds: string[] = [];

    public constructor(
        root: HTMLElement | string,
        {}: Partial<FileGridJsOptions>
    ) {}
}
