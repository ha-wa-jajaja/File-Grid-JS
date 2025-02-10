import FileGridFileUploader from "./FileUploader";
import FileGridContainer from "./GridContainer";

class FileGridItem {
    private _id: string;
    private _uploader: FileGridFileUploader | null;
    private _container: FileGridContainer;
    private _multiItemBoard: HTMLElement;
}

export default FileGridItem;
