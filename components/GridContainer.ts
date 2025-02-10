import FileGridFileUploader from "./FileUploader";
import FileGridItem from "./Item";

class FileGridContainer {
    private _uploader: FileGridFileUploader | null;
    private _items: FileGridItem[];
}

export default FileGridContainer;
